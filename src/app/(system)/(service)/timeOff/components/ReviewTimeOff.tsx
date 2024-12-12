import { useSetState } from "ahooks";
import RcTable, { ColumnsType } from "rc-table";
import { useEffect, useMemo, useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  checkTimeOff,
  userTimeOffRequestHandleShift,
  userTimeOffShiftEdit,
} from "@/api/timeOff";
import {
  ShiftTimeOffBaseVO,
  UserTimeOffRequestHandleShiftRes,
  UserTimeOffShiftEditReq,
} from "@/api/timeOff/types";
import { getUserWorkerListRoleAll } from "@/api/user";
import { GetUserWorkerListRoleAllReq } from "@/api/user/types";
import CustomButton from "@/components/custom/Button";
import Dialog from "@/components/custom/Dialog";
import CustomDialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import InputReview from "@/components/custom/review/InputReview";
import FixedSelect from "@/components/custom/Select/FixedSelect";
import Spin from "@/components/custom/Spin";
import { FormItem, FormLabel } from "@/components/FormComponent";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import useGlobalTime from "@/hooks/useGlobalTime";
import useMenuNumStore from "@/store/useMenuNumStore";
import sortListByKey from "@/utils/sortByKey";

import { TimeOffStatus, TimeOffVo } from "../types";

type RejectTimeOffDiaProps = {
  data: TimeOffVo | null;
  type: "review" | "view";
  timeOffId?: string;
  onClose: () => void;
  onSuccess: () => void;
};

type UserShiftList = Omit<
  UserTimeOffRequestHandleShiftRes,
  "shiftTimeOffBaseVOS"
> & {
  shift: ShiftTimeOffBaseVO;
  rowSpan: number;
  newUserId?: string;
  workerList: GetUserWorkerListRoleAllReq[];
};

const ReviewTimeOffDia = (props: RejectTimeOffDiaProps) => {
  const { data, type, timeOffId, onClose, onSuccess } = props;
  const { UTCMoment, zoneAbbr } = useGlobalTime();
  const [dialogLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const {
    control,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useForm<{
    comment: string;
  }>({
    defaultValues: {
      comment: "",
    },
  });

  const comment = watch("comment");

  const reasonRef = React.useRef<HTMLTextAreaElement>(null);

  const [RcTableScroll, setRcTableScroll] = useState<{ x: number; y?: number }>(
    {
      x: 1300,
    }
  );
  const [affectedShiftsCount, setAffectedShiftsCount] = useState(0);

  const [confirmInfo, setConfirmInfo] = useSetState<{
    loading: boolean;
    open: boolean;
    type: TimeOffStatus;
  }>({
    loading: false,
    open: false,
    type: "APPROVED",
  });

  const [userTimeOffShiftsDialog, setUserTimeOffShiftsDialog] = useSetState({
    loading: false,
    open: false,
    userShiftList: [] as UserShiftList[],
  });

  const [validateConfirm, setValidateConfirm] = useSetState({
    open: false,
    loading: false,
    isEdit: false,
    validateMsg: [] as string[],
    validateKey: "",
    type: "",
    repetitionKey: "",
    userTimeOffShiftEditFormData: {} as UserTimeOffShiftEditReq,
  });

  const handleConfirm = async (type: TimeOffStatus) => {
    setConfirmInfo({ loading: true });
    try {
      const res = await checkTimeOff({
        timeOffId: [data?.id || ""],
        status: type,
        comment: comment,
      });
      if (res.code === 200) {
        toast.success(type === "APPROVED" ? MESSAGE.approve : MESSAGE.reject);
        useMenuNumStore.getState().setIsRefreshTimeOff(true);
        onClose();
        onSuccess();
      }
    } finally {
      setConfirmInfo({ loading: false });
    }
  };

  const start = useMemo(() => {
    if (data?.startTimeUtc) {
      return `${UTCMoment(data?.startTimeUtc).format("MM/DD/YYYY hh:mm A")}`;
    } else {
      return "";
    }
  }, []);

  const end = useMemo(() => {
    if (data?.endTimeUtc) {
      return `${UTCMoment(data?.endTimeUtc).format(
        "MM/DD/YYYY hh:mm A"
      )} (${zoneAbbr})`;
    } else {
      return "";
    }
  }, []);

  const userShiftListColumns: ColumnsType<UserShiftList> = [
    {
      title: "Name",
      dataIndex: "userName",
      key: "userName",
      align: "left",
      onCell: (_, index) => ({
        rowSpan: _.rowSpan,
      }),
      width: 200,
      ellipsis: true,
    },
    {
      title: "Time Off Date Time",
      dataIndex: "startTimeUtc",
      key: "startTimeUtc",
      align: "left",
      width: 200,
      onCell: (_, index) => ({
        rowSpan: _.rowSpan,
      }),
      render: (_, { startTimeUtc, endTimeUtc }) => (
        <div>
          {UTCMoment(startTimeUtc).format("MM/DD/YYYY hh:mmA")} -{" "}
          {UTCMoment(endTimeUtc).format("MM/DD/YYYY hh:mmA")}
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: ["shift", "departmentName"],
      key: "departmentName",
      align: "left",
      width: 210,
      ellipsis: true,
    },
    {
      title: "Role",
      dataIndex: ["shift", "workerRoleName"],
      key: "workerRoleName",
      align: "left",
      width: 210,
      ellipsis: true,
    },
    {
      title: "Shift Date Time",
      dataIndex: "startTimeUTC",
      key: "startTimeUTC",
      align: "left",
      width: 200,
      render: (_, { shift: { startTimeUTC, endTimeUTC } }) => (
        <div>
          {UTCMoment(startTimeUTC).format("MM/DD/YYYY hh:mmA")} -{" "}
          {UTCMoment(endTimeUTC).format("MM/DD/YYYY hh:mmA")}
        </div>
      ),
    },
    {
      title: "Unassign / Reassign",
      dataIndex: "",
      key: "operations",
      width: 230,
      align: "left",
      render: (_, { newUserId, workerList, shift, userId }) => {
        return (
          <div>
            <FixedSelect
              isDisabled={userTimeOffShiftsDialog.loading}
              placeholder="Unassign / Reassign"
              value={newUserId}
              options={[
                { label: "Unassigned", value: "" },
                ...sortListByKey(
                  workerList
                    .map((item) => ({
                      value: item.userId,
                      label: `${item.firstName} ${item.lastName}`,
                    }))
                    .filter((item) => item.value !== userId)
                ),
              ]}
              onChange={(v) => {
                const newData = [...userTimeOffShiftsDialog.userShiftList];

                const currentShift = newData?.find(
                  (item) => item?.shift.id === shift.id
                );

                const yScroll = newData.length > 7 ? 500 : undefined;
                setRcTableScroll({ x: 1300, y: yScroll });

                if (currentShift) {
                  currentShift.newUserId = v;

                  setUserTimeOffShiftsDialog({
                    userShiftList: newData,
                  });
                }
              }}
            />
          </div>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "Action",
      key: "Action",
      width: 80,
      align: "center",
      render: (_, record) => {
        return (
          <div className="flex justify-center items-center">
            <CustomButton
              colorStyle="green"
              onClick={() => {
                if (userTimeOffShiftsDialog.loading) {
                  return;
                }

                handleEditShift(record);
              }}
            >
              Save
            </CustomButton>
          </div>
        );
      },
    },
  ];

  const handleEditShift = ({ shift, newUserId }: UserShiftList) => {
    let {
      communityId,
      departmentId,
      departmentName,
      id,
      locationRefVOs,
      note,
      isPublished,
      scheduleId,
      shiftDate,
      shiftStartTime,
      shiftEndTime,
      workerRoleId,
      workerRoleName,
      tags,
    } = shift;

    if (tags?.length) {
      if (!isPublished && (tags.includes(4) || tags.includes(5))) {
        isPublished = true;
      }
    }

    const userTimeOffShiftEditFormData = {
      communityId,
      departmentId,
      departmentName,
      id,
      note,
      scheduleId,
      shiftDate,
      shiftStartTime,
      shiftEndTime,
      workerRoleId,
      workerRoleName,
      tags,
      published: isPublished,
      confirmPublish: false,
      userId: newUserId || null,
      locationIds: locationRefVOs.map((item) => item.locationId),
    };

    setUserTimeOffShiftsDialog({
      loading: true,
    });

    userTimeOffShiftEdit(userTimeOffShiftEditFormData)
      .then(({ code, data }) => {
        if (code === 200) {
          if (data.isSuccess) {
            toast.success(MESSAGE.edit, {
              position: "top-center",
            });

            handleGetTimeOffRequestShift();
          } else {
            setValidateConfirm({
              open: true,
              isEdit: true,
              validateMsg: data.validateMsg,
              validateKey: data.validateKey,
              type: data.type,
              repetitionKey: data.repetitionKey,
              userTimeOffShiftEditFormData,
            });
          }
        }
      })
      .finally(() => {
        setUserTimeOffShiftsDialog({
          loading: false,
        });
      });
  };

  const handleGetTimeOffRequestShiftCount = async () => {
    if (timeOffId) {
      try {
        const userTimeOffRes = await userTimeOffRequestHandleShift(timeOffId);
        const filterEmptyUserShiftList = userTimeOffRes?.data?.filter(
          (item) => item.shiftTimeOffBaseVOS.length > 0
        );
        setAffectedShiftsCount(filterEmptyUserShiftList.length);
      } finally {
      }
    }
  };

  const handleGetTimeOffRequestShift = async () => {
    if (timeOffId) {
      try {
        setSubmitLoading(true);

        const userTimeOffRes = await userTimeOffRequestHandleShift(timeOffId);

        const filterEmptyUserShiftList = userTimeOffRes?.data?.filter(
          (item) => item.shiftTimeOffBaseVOS.length > 0
        );

        if (
          userTimeOffRes?.code === 200 &&
          filterEmptyUserShiftList?.length > 0
        ) {
          setConfirmInfo({ open: false });

          const userShiftList: UserShiftList[] =
            filterEmptyUserShiftList.flatMap((item) => {
              const { shiftTimeOffBaseVOS, ...rest } = item;

              const rowSpan = shiftTimeOffBaseVOS.length;

              return shiftTimeOffBaseVOS.map((shift, index) => ({
                ...rest,
                shift,
                rowSpan: index === 0 ? rowSpan : 0,
                isLoading: false,
                isSave: false,
                newUserId: "",
                workerList: [],
              }));
            });

          const workerListRecord: {
            [key: string]: GetUserWorkerListRoleAllReq[];
          } = {};

          for (const item of userShiftList) {
            const {
              communityId,
              shift: { workerRoleId },
            } = item;

            if (!workerListRecord?.[workerRoleId]) {
              const workerListRes = await getUserWorkerListRoleAll({
                communityId: communityId,
                roleId: workerRoleId,
              });

              if (workerListRes.code === 200) {
                workerListRecord[workerRoleId] = workerListRes?.data ?? [];
              }
            }

            item.workerList = workerListRecord?.[workerRoleId] ?? [];
          }
          const yScroll = userShiftList.length > 7 ? 500 : undefined;
          setRcTableScroll({ x: 1300, y: yScroll });

          setUserTimeOffShiftsDialog({
            open: true,
            userShiftList,
          });
        } else {
          setUserTimeOffShiftsDialog({
            open: false,
            loading: false,
          });

          setConfirmInfo({ open: true, type: "APPROVED" });
        }
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const handleValidateConfirm = (
    userTimeOffShiftEditFormData: UserTimeOffShiftEditReq
  ) => {
    userTimeOffShiftEditFormData.confirmPublish = true;

    setValidateConfirm({
      loading: true,
    });

    userTimeOffShiftEdit(userTimeOffShiftEditFormData)
      .then(({ code }) => {
        if (code === 200) {
          toast.success(MESSAGE.edit, {
            position: "top-center",
          });

          setValidateConfirm({
            open: false,
            loading: false,
            isEdit: false,
            validateMsg: [],
            validateKey: "",
          });

          handleGetTimeOffRequestShift();
        }
      })
      .finally(() => {
        setValidateConfirm({
          loading: false,
        });
      });
  };

  useEffect(() => {
    handleGetTimeOffRequestShiftCount();
  }, [userTimeOffShiftsDialog]);

  return (
    <Dialog
      open
      width="650px"
      title={type == "view" ? "View Time Off" : "Review Time Off"}
      onClose={onClose}
      loading={dialogLoading}
      footer={
        <div className="flex items-center">
          <CustomButton
            onClick={onClose}
            variant={"outline"}
            className="w-[110px]"
            disabled={submitLoading}
          >
            Cancel
          </CustomButton>
          {type === "review" && (
            <>
              <CustomButton
                className="w-[110px] ml-[22px]"
                colorStyle="red"
                onClick={() => {
                  if (comment.trim() === "") {
                    if (reasonRef.current) {
                      reasonRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }
                    setError("comment", {
                      message: "This field is required.",
                    });
                    return;
                  } else {
                    clearErrors("comment");
                    setConfirmInfo({ open: true, type: "REJECTED" });
                  }
                }}
              >
                Reject
              </CustomButton>
              <CustomButton
                loading={submitLoading}
                disabled={affectedShiftsCount > 0 ? true : false}
                className="w-[110px] ml-[22px]"
                colorStyle="green"
                onClick={() => {
                  // handleGetTimeOffRequestShift();
                  setConfirmInfo({ open: true, type: "APPROVED" });
                }}
              >
                Approve
              </CustomButton>
            </>
          )}
        </div>
      }
      contentWrapperClassName="pr-1"
    >
      <div className="overflow-y-auto overflow-x-hidden w-full max-h-[calc(100vh-180px)] pr-3 pb-4">
        <InputReview
          labelClassName="w-[100px]"
          label="Name:"
          value={data?.userName}
          layout="horizontal"
        />
        <InputReview
          labelClassName="w-[100px]"
          label="Date/Time:"
          value={start + " - " + end}
          layout="horizontal"
        />
        <InputReview
          labelClassName="w-[170px]"
          label="Reason for Time Off:"
          value={data?.reason}
          layout="horizontal"
        />
        {type !== "review" && (
          <>
            <InputReview
              labelClassName="w-[180px]"
              label="Approved/Rejected By:"
              value={data?.reviewName}
              layout="horizontal"
            />
            <InputReview
              labelClassName="w-[220px]"
              label="Approval/Rejection Date Time:"
              value={
                data?.reviewTime
                  ? `${UTCMoment(data?.reviewTime).format(
                      "MM/DD/YYYY hh:mm A"
                    )} (${zoneAbbr})`
                  : ""
              }
              layout="horizontal"
            />
          </>
        )}

        {data?.comment && (
          <InputReview
            labelClassName="w-[140px]"
            label="Review Comment:"
            value={data?.comment}
            layout="horizontal"
          />
        )}
        {type === "review" && (
          <FormLabel label="Please enter a comment:">
            <FormItem
              name="comment"
              control={control}
              errors={errors.comment}
              render={({ field: { value, onChange } }) => (
                <Textarea
                  ref={reasonRef}
                  rows={8}
                  value={value}
                  onChange={(e) => {
                    onChange(e);
                    const value = e.target.value;
                    if (value.trim() !== "") {
                      clearErrors("comment");
                    }
                  }}
                  placeholder="Comment"
                />
              )}
            />
          </FormLabel>
        )}
        {type === "review" && (
          <span
            onClick={() => {
              if (affectedShiftsCount !== 0) handleGetTimeOffRequestShift();
            }}
            className="underline cursor-pointer text-primary min-h-10 text-[#919FB4] text-[14px]"
          >
            Affected Shifts ({affectedShiftsCount})
          </span>
        )}
      </div>

      <ConfirmDialog
        btnLoading={confirmInfo.loading}
        open={confirmInfo.open}
        onClose={() => {
          setConfirmInfo({ open: false });
        }}
        onOk={() => {
          handleConfirm(confirmInfo.type);
        }}
      >
        {` Are you sure you want to ${
          confirmInfo.type === "APPROVED" ? "approve" : "reject"
        } this request?`}
      </ConfirmDialog>

      <CustomDialog
        width="1400px"
        title="Approve Time Off"
        open={userTimeOffShiftsDialog.open}
        onClose={() => {
          setUserTimeOffShiftsDialog({
            open: false,
          });
        }}
        contentWrapperClassName="p-[25px]"
      >
        <div className="mb-[15px]">
          The employee has the following shifts scheduled during the requested
          time off. You need to unassign or reassign the shifts before approving
          the time off request.
        </div>

        <Spin loading={userTimeOffShiftsDialog.loading}>
          <RcTable
            rowKey={(record) => record.shift.id}
            columns={userShiftListColumns}
            data={userTimeOffShiftsDialog.userShiftList}
            scroll={RcTableScroll}
          />
        </Spin>
      </CustomDialog>

      <ConfirmDialog
        open={validateConfirm.open}
        btnLoading={validateConfirm.loading}
        width="560px"
        onClose={() => {
          setValidateConfirm({
            open: false,
            loading: false,
            isEdit: false,
            validateMsg: [],
            validateKey: "",
          });
        }}
        onOk={() =>
          handleValidateConfirm(validateConfirm.userTimeOffShiftEditFormData)
        }
      >
        <div>
          {validateConfirm?.validateMsg?.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      </ConfirmDialog>
    </Dialog>
  );
};
export default ReviewTimeOffDia;
