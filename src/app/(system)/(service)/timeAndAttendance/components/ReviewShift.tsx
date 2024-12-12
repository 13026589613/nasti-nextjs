import { useSetState } from "ahooks";
import { useEffect, useMemo, useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

import { saveShiftBreak } from "@/api/currentSchedule";
import { shiftBreakList } from "@/api/currentSchedule";
import {
  getTimeAndAttendanceInfo,
  timeAndAttendanceReview,
  timeAndAttendanceReviewBreak,
} from "@/api/timeAndAttendance";
import useReturnTableColumn from "@/app/(system)/(service)/currentSchedule/components/timeAndAttendance/tableColumn";
import {
  TimeAndAttendanceFromVo,
  TimeAndAttendanceVo,
} from "@/app/(system)/(service)/currentSchedule/types";
import CustomButton from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import Dialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import Input from "@/components/custom/Input";
import Select, { OptionType } from "@/components/custom/Select";
import CustomTable from "@/components/custom/Table";
import { FormItem, FormLabel } from "@/components/FormComponent";
import PageTitle from "@/components/PageTitle";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalTime from "@/hooks/useGlobalTime";
import useHasPermission from "@/hooks/useHasPermission";
import Add from "~/icons/AddIcon.svg";

import ShiftHistory from "../../currentSchedule/components/ShiftHistory";
import { ExceptionReason, ExceptionsDetail } from "../types";
import DetailLayout from "./DetailLayout";
import SelectTimeDia from "./selectTimeDia";
import ShiftInfo from "./ShiftInfo";

export interface ReviewShiftProps {
  id: string;
  shiftId: string;
  refresh: () => void;
  onClose?: () => void;
  onSuccessful?: (type: string | null) => void;
}

const ReviewShift = (props: ReviewShiftProps) => {
  const { id, refresh, onClose, onSuccessful } = props;
  const { communityId } = useGlobalCommunityId();
  const { UTCMoment } = useGlobalTime();
  const [tableData, setTableData] = useState<TimeAndAttendanceVo[]>([]);
  const {
    control,
    watch,
    formState: { errors },
    clearErrors,
  } = useForm<{
    comment: string;
  }>({
    defaultValues: {
      comment: "",
    },
  });
  const {
    control: dialogFormControl,
    formState: { errors: dialogFormErrors },
    handleSubmit,
    setValue,
    resetField,
  } = useForm<TimeAndAttendanceFromVo>({
    defaultValues: {
      breakType: "",
      durationMins: "",
    },
  });
  const comment = watch("comment");
  const reasonRef = React.useRef<HTMLTextAreaElement>(null);
  const [diaType, setDiaType] = useState<"Edit" | "Add">();
  const [confirmDia, setConfirmDia] = useState<boolean>(false);
  const [tableRowId, setTableRowId] = useState<string>("");
  const [backupTableData, setBackupTableDate] = useState<TimeAndAttendanceVo[]>(
    []
  );
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [formDialogLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [confirmInfo, setConfirmInfo] = useSetState<{
    type: "approve" | "confirm";
    loading: boolean;
    open: boolean;
  }>({
    type: "approve",
    loading: false,
    open: false,
  });
  const [breakTypeOptions] = useState<OptionType[]>([
    { label: "Break", value: "Break" },
    { label: "Meal", value: "Meal" },
  ]);
  const handleDelete = (id: string): void => {
    if (tableData.length === 1) return;
    setTableRowId(id);
    setConfirmDia(true);
  };
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const handleEdit = ({
    breakType,
    durationMins,
    id,
  }: TimeAndAttendanceVo): void => {
    setTableRowId(id);
    setValue("breakType", breakType);
    setValue("durationMins", durationMins);
    setDiaType("Edit");
    setFormDialogOpen(true);
  };
  const { isHasApproveAttendancePermission } = useHasPermission();
  const [editInfo, setEditInfo] = useState<boolean>(false);
  const handleAdd = (): void => {
    setDiaType("Add");
    setFormDialogOpen(true);
  };
  const [exceptionInfo, setExceptionInfo] = useSetState<{
    data: ExceptionsDetail | null;
    loading: boolean;
  }>({
    data: null,
    loading: false,
  });
  const [shiftStatus, setShiftStatus] = useState<ExceptionReason>();
  const getExceptionsDetail = async () => {
    try {
      setExceptionInfo({ loading: true });
      const { code, data } = await getTimeAndAttendanceInfo(id);
      if (code !== 200) return;
      const {
        locationNames,
        attendeeType,
        attendeeUsername,
        attendeeUserId,
        startTimeUtc,
        endTimeUtc,
        checkInUtc,
        checkOutUtc,
        communityId,
        status,
        note,
      } = data;
      setShiftStatus(status);

      setExceptionInfo({
        data: {
          ...data,
          communityId,
          attendeeType,
          note,
          locationId: "",
          locationName: locationNames || "",
          username: attendeeUsername || "",
          userId: attendeeUserId || "",
          startTimeLocal: startTimeUtc
            ? `${UTCMoment(startTimeUtc).format("MM/DD/YYYY hh:mm A")}`
            : "",
          endTimeLocal: endTimeUtc
            ? `${UTCMoment(endTimeUtc).format("MM/DD/YYYY hh:mm A")}`
            : "",
          checkInTimeLocal: checkInUtc
            ? `${UTCMoment(checkInUtc).format("MM/DD/YYYY hh:mm A")}`
            : "",
          checkOutTimeLocal: checkOutUtc
            ? `${UTCMoment(checkOutUtc).format("MM/DD/YYYY hh:mm A")}`
            : "",
          location: {
            lat:
              data.attendeeType === "CHECK_IN"
                ? data.checkinLat
                : data.checkoutLat,
            lng:
              data.attendeeType === "CHECK_IN"
                ? data.checkinLng
                : data.checkoutLng,
          },
        },
      });
    } finally {
      setExceptionInfo({ loading: false });
    }
  };
  const shiftId = useMemo(() => {
    return exceptionInfo.data?.shiftId || "";
  }, [exceptionInfo.data]);
  useEffect(() => {
    getExceptionsDetail();
  }, [id]);
  useEffect(() => {
    getShiftBreakList();
  }, [exceptionInfo.data]);
  const { columns } = useReturnTableColumn({
    disableDelete: tableData.length === 1,
    isHasApproveAttendancePermission,
    handleDelete,
    handleEdit,
  }); // delete
  const inviteConfirmFn = async (): Promise<void> => {
    try {
      setConfirmLoading(true);
      setTableData(tableData.filter((item) => item.id !== tableRowId));
      setConfirmDia(false);
    } finally {
      setConfirmLoading(false);
    }
  };
  const getShiftBreakList = async () => {
    try {
      if (!shiftId) return;
      const { data, code } = await shiftBreakList(shiftId);
      if (code !== 200) return;
      const tableData = data.map((item: any) => {
        return {
          ...item,
          isApiData: true,
        };
      });
      setTableData(tableData);
      setBackupTableDate(JSON.parse(JSON.stringify(tableData)));
    } catch (error) {}
  };
  const reviewSubmit = async (btnType: string, dateAndTime?: string) => {
    try {
      setConfirmInfo({
        loading: true,
      });
      if (!exceptionInfo.data) return;
      const { id, shiftId, communityId, attendeeType, shiftReviewId } =
        exceptionInfo.data;
      const param = {
        id,
        shiftId,
        communityId,
        reviewType: "APPROVED",
        attendeeTime: dateAndTime || "",
        attendeeType,
        comment,
      };
      const res = exceptionInfo.data.status.includes("BREAK_TIME")
        ? await timeAndAttendanceReviewBreak({
            reviewId: shiftReviewId,
            comment,
          })
        : await timeAndAttendanceReview(param);

      if (res.code === 200) {
        onClose && onClose();
        onSuccessful && onSuccessful(btnType);
      }
    } finally {
      setConfirmInfo({
        loading: false,
      });
    }
  };
  const resetForm = (): void => {
    resetField("breakType");
    resetField("durationMins");
    setValue("breakType", "");
    setValue("durationMins", "");
  };
  const onFormDialogClose = (): void => {
    resetForm();
    setFormDialogOpen(false);
  };
  // Add or Edit
  const saveAddOrEdit = (formData: TimeAndAttendanceFromVo): void => {
    setSubmitLoading(true);
    try {
      if (diaType === "Edit") {
        // handle Edit
        const list = tableData.map((row) => {
          if (row.id === tableRowId) {
            const { durationMins, breakType } = formData;
            row.durationMins = durationMins;
            row.breakType = breakType;
          }
          return row;
        });
        setTableData(list);
      } else {
        // handle Add
        setTableData([...tableData, { id: uuidv4(), ...formData }]);
        setFormDialogOpen(false);
      }
    } finally {
      setSubmitLoading(false);
      onFormDialogClose();
    }
  };
  const onSubmit = async () => {
    try {
      if (JSON.stringify(tableData) === JSON.stringify(backupTableData))
        return setEditInfo(false);
      setSubmitLoading(true);
      const breakList = tableData.map((item: any) => {
        const { id, durationMins, breakType, isApiData } = item;
        return {
          id: isApiData ? id : undefined,
          durationMins,
          breakType,
          communityId,
          shiftId,
        };
      });
      const params = {
        actionType: 1,
        shiftId,
        communityId,
        breakList,
        comment,
      };

      const { code } = await saveShiftBreak(params);
      if (code === 200) {
        toast.success(MESSAGE.save, {
          position: "top-center",
        });
        setEditInfo(false);
        refresh();
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const isShowApprove = useMemo(() => {
    if (exceptionInfo.data) {
      const { status } = exceptionInfo.data;
      return [
        "LATE_CHECK_IN",
        "LATE_CHECK_OUT",
        "BREAK_TIME_EXCEPTION",
        "EARLY_CHECK_OUT",
      ].includes(
        status.includes("BREAK_TIME") ? "BREAK_TIME_EXCEPTION" : status
      );
    } else {
      return false;
    }
  }, [exceptionInfo.data]);
  return (
    <DetailLayout
      loading={exceptionInfo.loading}
      footerRender={
        <>
          <CustomButton
            onClick={onClose}
            variant={"outline"}
            className="w-[110px]"
          >
            Cancel
          </CustomButton>
          <CustomButton
            className="w-[110px] ml-[22px]"
            colorStyle="yellow"
            onClick={() => {
              getShiftBreakList();
              setEditInfo(true);
            }}
          >
            Edit
          </CustomButton>
          {isShowApprove && (
            <CustomButton
              className="w-[110px] ml-[22px]"
              colorStyle="green"
              onClick={() => {
                setConfirmInfo({ open: true, type: "approve" });
              }}
            >
              Approve
            </CustomButton>
          )}
          {shiftStatus === "NO_SHOW" && (
            <CustomButton
              className="w-[110px] ml-[22px]"
              colorStyle="green"
              onClick={() => {
                setConfirmInfo({ open: true, type: "confirm" });
              }}
            >
              Confirm
            </CustomButton>
          )}
        </>
      }
    >
      <>
        <PageTitle title="Shift Details" isClose={false} />

        {exceptionInfo.data && (
          <ShiftInfo
            tableData={tableData}
            data={exceptionInfo.data}
          ></ShiftInfo>
        )}

        <FormLabel className="mt-5" label="Comment:">
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
      </>
      {exceptionInfo.data?.shiftId && (
        <ShiftHistory
          shiftId={exceptionInfo.data?.shiftId as string}
        ></ShiftHistory>
      )}

      {editInfo &&
        exceptionInfo.data &&
        !exceptionInfo.data.status.includes("BREAK_TIME") && (
          <SelectTimeDia
            data={exceptionInfo.data}
            open={editInfo}
            onClose={() => {
              setEditInfo(false);
            }}
            onSuccessful={(data) => {
              reviewSubmit("save", data);
            }}
          ></SelectTimeDia>
        )}

      {editInfo &&
        exceptionInfo.data &&
        exceptionInfo.data.status.includes("BREAK_TIME") && (
          <CustomDialog
            title="Edit"
            open={editInfo}
            onClose={() => {
              setEditInfo(false);
            }}
          >
            {/* isHasApproveAttendancePermission */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#324664]">Break Times</span>
              {isHasApproveAttendancePermission && (
                <div
                  className="flex items-center cursor-pointer"
                  onClick={handleAdd}
                >
                  <Add className="mr-2" width={8} color={"#EB1DB2"}></Add>
                  <span className="text-[#EB1DB2]">Add</span>
                </div>
              )}
            </div>
            <CustomTable
              className="my-4 min-h-[100px]"
              height="auto"
              adaptive={false}
              columns={columns}
              data={tableData}
              loading={false}
              manualPagination={true}
            />
            <div className="flex justify-end">
              <CustomButton
                onClick={async () => {
                  await getShiftBreakList();
                  setEditInfo(false);
                }}
                variant={"outline"}
                className="w-[110px]"
              >
                Cancel
              </CustomButton>

              <CustomButton
                loading={submitLoading}
                className="w-[110px] ml-[22px] bg-[#EB1DB2]"
                onClick={onSubmit}
              >
                Save
              </CustomButton>
            </div>
            <ConfirmDialog
              btnLoading={confirmLoading}
              open={confirmDia}
              onClose={() => {
                setConfirmDia(false);
              }}
              onOk={() => {
                inviteConfirmFn();
              }}
            >
              Are you sure you want to delete this Break Time?
            </ConfirmDialog>
            <Dialog
              open={formDialogOpen}
              width="517px"
              title={`${diaType} Break Time`}
              onClose={onFormDialogClose}
              loading={formDialogLoading}
              contentWrapperClassName="pr-1"
            >
              <div className="pr-4">
                <FormLabel label="Break Type" required>
                  <FormItem
                    name="breakType"
                    control={dialogFormControl}
                    errors={dialogFormErrors.breakType}
                    rules={{ required: "This field is required." }}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        options={breakTypeOptions}
                        value={value}
                        onChange={(newValue) => {
                          onChange(newValue);
                        }}
                        placeholder="Break Type"
                      />
                    )}
                  />
                </FormLabel>

                <FormLabel label="Break Time (mins)" required>
                  <FormItem
                    name="durationMins"
                    control={dialogFormControl}
                    errors={dialogFormErrors.durationMins}
                    rules={{ required: "This field is required." }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        className="h-12"
                        placeholder="Break Time"
                      />
                    )}
                  />
                </FormLabel>
                <div className="flex justify-end">
                  <CustomButton
                    onClick={onFormDialogClose}
                    variant={"outline"}
                    className="w-[110px]"
                  >
                    Cancel
                  </CustomButton>

                  <CustomButton
                    className="w-[110px] ml-[22px] bg-[#EB1DB2]"
                    onClick={handleSubmit((data) => {
                      saveAddOrEdit(data);
                    })}
                  >
                    Save
                  </CustomButton>
                </div>
              </div>
            </Dialog>
          </CustomDialog>
        )}

      <ConfirmDialog
        btnLoading={confirmInfo.loading}
        open={confirmInfo.open}
        onClose={() => {
          setConfirmInfo({ open: false });
        }}
        onOk={() => {
          reviewSubmit(confirmInfo.type, "");
        }}
      >
        {`Are you sure you want to ${confirmInfo.type} this record?`}
      </ConfirmDialog>
    </DetailLayout>
  );
};

export default ReviewShift;
