import { useSetState } from "ahooks";
import { useRef, useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  approveShiftSwap,
  rejectShiftSwap,
} from "@/api/shiftsThatNeedHelp/shiftSwaps";
import CustomButton from "@/components/custom/Button";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, {
  CustomColumnDef,
  RefProps,
} from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { FormItem, FormLabel } from "@/components/FormComponent";
import PageTitle from "@/components/PageTitle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import useMenuNumStore from "@/store/useMenuNumStore";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";

import ShiftHistory from "../../../currentSchedule/components/ShiftHistory";
import { NeedHelpShift, SwapsData } from "../../types";
import { isOverTime } from "../../utils";
import ChatIcon from "../ChatIcon";
import DetailLayout from "../DetailLayout";
import ShiftInfo from "../ShiftInfo";

export interface ReviewNeedHelpShiftProps {
  needHelpShift: NeedHelpShift;

  onClose?: () => void;
  onSuccessful?: () => void;
}

const ReviewSwapsShift = (props: ReviewNeedHelpShiftProps) => {
  const { needHelpShift, onClose, onSuccessful } = props;
  const [selected, setSelected] = useState<any>(null);
  const tableRef = React.createRef<RefProps>();

  const handleShift = async () => {
    try {
      setConfirmInfo({
        loading: true,
      });
      if (confirmInfo.type === "APPROVED") {
        const { code } = await approveShiftSwap({
          requestId: selected,
          comment: comment || null,
        });
        if (code === 200) {
          onSuccessful && onSuccessful();
          useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
        }
      } else {
        const { code } = await rejectShiftSwap({
          reviewId: needHelpShift.id,
          comment,
        });
        if (code === 200) {
          onSuccessful && onSuccessful();
          useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
        }
      }
    } finally {
      setConfirmInfo({
        loading: false,
      });
    }
  };

  const columns = useRef<CustomColumnDef<SwapsData>[]>([
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
              setSelected(row.original.id);
            }}
            value={row.original.id}
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
        const { employee, userId, tags } = row.original;

        return (
          <div className="flex items-center gap-4 cursor-pointer w-full h-full">
            {employee} <ChatIcon targetUserId={userId} />
            <div className="flex items-center justify-center w-6 h-4 mb-[4px]">
              {isOverTime(tags) && (
                <Tooltip content={"Overtime"}>
                  <OvertimeIcon width="16px" height="16px"></OvertimeIcon>
                </Tooltip>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Phone Number
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "shiftEndTime",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Shift Date Time
          </div>
        );
      },
      cell: ({ row }) => {
        return <div>{row.original.shiftDateTime}</div>;
      },
    },
    {
      accessorKey: "location",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Location
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("location")}</div>,
    },
    {
      accessorKey: "note",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Notes
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("note")}</div>,
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

  return (
    <DetailLayout
      footerRender={
        <>
          {" "}
          <div className="flex justify-end">
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
              className="w-[110px] ml-[22px]"
              colorStyle="green"
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
          </div>
        </>
      }
    >
      <div className="pb-5">
        <PageTitle title="Shift Details" isClose={false} />
        <ShiftInfo
          currentView={"shiftSwaps"}
          needHelpShift={needHelpShift}
        ></ShiftInfo>

        <div className="mt-6 mb-1 text-[18px] font-[450] leading-10">
          Employees that accepted the swap request
        </div>
        <RadioGroup
          value={selected}
          onChange={(value) => {
            setSelected(value);
          }}
        >
          <CustomTable
            adaptive={false}
            height="auto"
            tableClassName="min-h-200px"
            lightIndex={selected}
            ref={tableRef}
            columns={columns.current}
            data={needHelpShift.employeeList}
          />
        </RadioGroup>

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

        {/* <ShiftHistory shiftId={needHelpShift.id}></ShiftHistory> */}
        {needHelpShift.shiftId && (
          <ShiftHistory shiftId={needHelpShift.shiftId || ""}></ShiftHistory>
        )}

        <ConfirmDialog
          btnLoading={confirmInfo.loading}
          open={confirmInfo.open}
          onClose={() => {
            setConfirmInfo({ open: false });
          }}
          onOk={() => {
            handleShift();
          }}
        >
          {` Are you sure you want to ${
            confirmInfo.type === "APPROVED" ? "approve" : "reject"
          } this request?`}
        </ConfirmDialog>
      </div>
    </DetailLayout>
  );
};

export default ReviewSwapsShift;
