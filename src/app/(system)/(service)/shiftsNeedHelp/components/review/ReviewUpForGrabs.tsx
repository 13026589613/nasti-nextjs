import { useSetState } from "ahooks";
import { useRef, useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { reviewUfgShift } from "@/api/shiftsThatNeedHelp/callOffShift";
import CustomButton from "@/components/custom/Button";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, {
  CustomColumnDef,
  RefProps,
} from "@/components/custom/Table";
import { FormItem, FormLabel } from "@/components/FormComponent";
import PageTitle from "@/components/PageTitle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import useGlobalTime from "@/hooks/useGlobalTime";
import useMenuNumStore from "@/store/useMenuNumStore";

// import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";
import ShiftHistory from "../../../currentSchedule/components/ShiftHistory";
import {
  ReviewUfgShiftReq,
  ShiftUfgRequestListRes,
  UfgShiftClaim,
} from "../../types";
import ApproveAndReassignDia from "../ApproveAndReassignDia";
import ApproveRadioDia, { BtnType } from "../ApproveRadioDia";
import ChatIcon from "../ChatIcon";
import DetailLayout from "../DetailLayout";
import SelectShiftToCoverDia from "../SelectShiftToCoverDia";
import ShiftInfo from "../ShiftInfo";

export interface ReviewNeedHelpShiftProps {
  needHelpShift: ShiftUfgRequestListRes;

  onClose?: () => void;
  onSuccessful?: () => void;
}

const ReviewUpForGrabs = (props: ReviewNeedHelpShiftProps) => {
  const { needHelpShift, onClose, onSuccessful } = props;
  const [selected, setSelected] = useState<any>(null);
  const tableRef = React.createRef<RefProps>();

  const { UTCMoment, zoneAbbr } = useGlobalTime();

  const columns = useRef<CustomColumnDef<UfgShiftClaim>[]>([
    {
      id: "select",
      width: 50,
      header: () => {
        return <></>;
      },
      cell: ({ row }) => {
        return (
          <RadioGroupItem
            // disabled={true}
            onClick={() => {
              tableRef.current?.clearSelectedRows();
              row.toggleSelected(true);
              setSelected(row.original.claimedBy);
            }}
            value={row.original.claimedBy}
          ></RadioGroupItem>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "employee",
      header: () => {
        return (
          <div className="flex items-center gap-4 cursor-pointer w-full h-full">
            Employee
          </div>
        );
      },
      cell: ({ row }) => {
        const { claimedBy, username } = row.original;
        return (
          <div className="flex items-center gap-4 cursor-pointer w-full h-full">
            {username} <ChatIcon key={claimedBy} targetUserId={claimedBy} />
            {/* <OvertimeIcon className="w-4 h-4"></OvertimeIcon> */}
          </div>
        );
      },
    },
    {
      accessorKey: "nationalPhone",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Phone Number
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("nationalPhone")}</div>,
    },
    {
      accessorKey: "shiftEndTime",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Claimed Date Time
          </div>
        );
      },
      cell: ({ row }) => {
        const { createdAt } = row.original;
        return (
          <div>
            {`${UTCMoment(createdAt).format(
              "MM/DD/YYYY hh:mm A"
            )} (${zoneAbbr})`}
          </div>
        );
      },
    },
  ]);

  const [submitLoading] = useState(false);
  const {
    control,
    setError,
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
  const comment = watch("comment");
  const reasonRef = React.useRef<HTMLTextAreaElement>(null);

  const [confirmInfo, setConfirmInfo] = useSetState<{
    loading: boolean;
    open: boolean;
    type: "APPROVED" | "REJECTED";
  }>({
    loading: false,
    open: false,
    type: "APPROVED",
  });

  const [coverConfirm, setCoverConfirm] = useSetState({
    open: false,
    loading: false,
  });

  const [reassignConfirm, setReassignConfirm] = useSetState({
    loading: false,
    open: false,
  });

  const [partialApproveDia, setPartialApproveDia] = useSetState({
    loading: false,
    open: false,
  });

  const [coverShiftDia, setCoverShiftDia] = useSetState({
    loading: false,
    open: false,
  });

  //0: reject, 1: approve, 2: approve and reassign, 4: approve and create new shift, 5: approve and give up hours
  const ReviewUfgShift = async ({
    type,
    callback,
    userId,
  }: {
    userId?: string;
    type: 0 | 1 | 2 | 4 | 5;
    callback: Function;
  }) => {
    let data: ReviewUfgShiftReq = {
      actionType: type,
      id: needHelpShift.id,
      reviewComment: comment,
    };
    if (type === 2 || type === 1) {
      data.targetUserId = userId;
    }
    const res = await reviewUfgShift(data);
    if (res.code === 200) {
      callback();
    }
  };

  const rejectUfgShift = async () => {
    try {
      setConfirmInfo({ loading: true });
      await ReviewUfgShift({
        type: 0,
        callback: () => {
          toast.success(MESSAGE.reject);
          setConfirmInfo({
            open: false,
          });
          onClose && onClose();
          onSuccessful && onSuccessful();
          useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
        },
      });
    } finally {
      setConfirmInfo({ loading: false });
    }
  };

  const approveUfgShift = async () => {
    try {
      setConfirmInfo({ loading: true });
      await ReviewUfgShift({
        type: 1,
        userId: selected,
        callback: () => {
          toast.success(MESSAGE.approve);
          setConfirmInfo({
            open: false,
          });
          onClose && onClose();
          onSuccessful && onSuccessful();
          useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
        },
      });
    } finally {
      setConfirmInfo({ loading: false });
    }
  };

  const approveAndReassign = async (userId: string) => {
    try {
      setConfirmInfo({ loading: true });
      await ReviewUfgShift({
        type: 2,
        userId,
        callback: () => {
          toast.success(MESSAGE.approve);
          setConfirmInfo({
            open: false,
          });
          onClose && onClose();
          onSuccessful && onSuccessful();
          useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
        },
      });
    } finally {
      setConfirmInfo({ loading: false });
    }
  };

  const approveAndCreateNewShift = async () => {
    try {
      setPartialApproveDia({
        loading: true,
      });
      await ReviewUfgShift({
        type: 4,
        callback: () => {
          toast.success(MESSAGE.approve);
          setPartialApproveDia({
            open: false,
          });
          onClose && onClose();
          onSuccessful && onSuccessful();
          useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
        },
      });
    } finally {
      setPartialApproveDia({ loading: false });
    }
  };

  const approveAndGiveUpHours = async () => {
    try {
      setPartialApproveDia({
        loading: true,
      });
      await ReviewUfgShift({
        type: 5,
        callback: () => {
          toast.success(MESSAGE.approve);
          setPartialApproveDia({
            open: false,
          });
          onClose && onClose();
          onSuccessful && onSuccessful();
          useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
        },
      });
    } finally {
      setPartialApproveDia({ loading: false });
    }
  };

  const partialApprove = async (type: BtnType) => {
    switch (type) {
      case "remove":
        approveAndGiveUpHours();
        break;
      case "new":
        approveAndCreateNewShift();
        break;
      case "cover":
        setPartialApproveDia({
          open: false,
          loading: false,
        });
        setCoverShiftDia({
          open: true,
        });
        break;
    }
  };

  return (
    <DetailLayout
      footerRender={
        <>
          <CustomButton
            onClick={onClose}
            variant={"outline"}
            className="w-[110px]"
            disabled={submitLoading}
          >
            Cancel
          </CustomButton>
          <CustomButton
            className="w-[110px] ml-[22px]"
            colorStyle="red"
            loading={confirmInfo.loading}
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
          {needHelpShift.claimList && needHelpShift.claimList.length > 0 && (
            <CustomButton
              className="w-[110px] ml-[22px]"
              colorStyle="green"
              loading={confirmInfo.loading}
              onClick={() => {
                if (selected === null) {
                  toast.warning("Please select an employee to approve.");
                  return;
                }
                setConfirmInfo({ open: true, type: "APPROVED" });
              }}
            >
              Approve
            </CustomButton>
          )}

          {needHelpShift.partialShift === "No" && (
            <CustomButton
              className="ml-[22px]"
              colorStyle="green"
              onClick={() => {
                setReassignConfirm({
                  open: true,
                });
              }}
            >
              Approve & Re-assign
            </CustomButton>
          )}
          {needHelpShift.partialShift === "Yes" && (
            <CustomButton
              className="ml-[22px]"
              colorStyle="green"
              onClick={() => {
                setPartialApproveDia({
                  open: true,
                });
              }}
            >
              Approve
            </CustomButton>
          )}
        </>
      }
    >
      <PageTitle title="Shift Details" isClose={false} />
      <ShiftInfo
        currentView={"upForGrabs"}
        needHelpShift={needHelpShift}
      ></ShiftInfo>
      {needHelpShift.claimList.length > 0 && (
        <>
          <div className="flex gap-2 items-center mt-6 mb-1">
            <span className="text-[18px] font-[450] leading-10">
              Employees that claimed this shift
            </span>
            <span className="leading-10">
              {`(If you want to assign the shift to someone else that is not in
              this list, you can select the "Approve & Re-assign" button.)`}
            </span>
          </div>
          <RadioGroup
            value={selected}
            onChange={(value) => {
              setSelected(value);
            }}
          >
            <CustomTable
              ref={tableRef}
              adaptive={false}
              height="auto"
              tableClassName="min-h-200px"
              columns={columns.current}
              data={needHelpShift.claimList}
              lightIndex={selected}
            />
          </RadioGroup>
        </>
      )}

      <FormLabel className="mt-5" label="Comment">
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

      <ShiftHistory shiftId={needHelpShift.shiftId}></ShiftHistory>

      <ConfirmDialog
        btnLoading={confirmInfo.loading}
        open={confirmInfo.open}
        onClose={() => {
          setConfirmInfo({ open: false });
        }}
        onOk={() => {
          if (confirmInfo.type === "APPROVED") {
            approveUfgShift();
          } else {
            rejectUfgShift();
          }
        }}
      >
        {` Are you sure you want to ${
          confirmInfo.type === "APPROVED" ? "approve" : "reject"
        } this request?`}
      </ConfirmDialog>
      <ConfirmDialog
        btnLoading={coverConfirm.loading}
        open={coverConfirm.open}
        onClose={() => {
          setCoverConfirm({ open: false });
        }}
        onOk={() => {
          approveAndCreateNewShift();
        }}
      >
        Are you sure you want to create an open shift to cover the time range
        that needs coverage?
      </ConfirmDialog>
      {reassignConfirm.open && (
        <ApproveAndReassignDia
          roleId={needHelpShift.roleId}
          claimUserIds={needHelpShift.claimList.map((claim) => claim.claimedBy)}
          userId={needHelpShift.userId}
          open={reassignConfirm.open}
          onClose={() => {
            setReassignConfirm({
              open: false,
            });
          }}
          onSuccessful={async (employee) => {
            await approveAndReassign(employee);
            return true;
          }}
        ></ApproveAndReassignDia>
      )}
      {partialApproveDia.open && (
        <ApproveRadioDia
          open={partialApproveDia.open}
          loading={partialApproveDia.loading}
          onClose={() => {
            setPartialApproveDia({
              open: false,
              loading: false,
            });
          }}
          onSuccessful={partialApprove}
        ></ApproveRadioDia>
      )}
      {coverShiftDia.open && (
        <SelectShiftToCoverDia
          ufgId={needHelpShift.ufgRequest.id}
          open={coverShiftDia.open}
          onClose={() => {
            setCoverShiftDia({
              open: false,
            });
          }}
          comment={comment}
          onSuccessful={() => {
            setCoverShiftDia({
              open: false,
            });
            onClose && onClose();
            onSuccessful && onSuccessful();
          }}
        ></SelectShiftToCoverDia>
      )}
    </DetailLayout>
  );
};

export default ReviewUpForGrabs;
