import { useSetState } from "ahooks";
import { useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { overtimeBatch } from "@/api/shiftsThatNeedHelp/overTimeShift";
import ScheduleIndex from "@/app/(system)/(service)/currentSchedule/components";
import CustomButton from "@/components/custom/Button";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import { FormItem, FormLabel } from "@/components/FormComponent";
import PageTitle from "@/components/PageTitle";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import useMenuNumStore from "@/store/useMenuNumStore";
import events from "@/utils/event";
import { useEventBus } from "@/utils/event";

import ShiftHistory from "../../../currentSchedule/components/ShiftHistory";
import { NeedHelpShiftTabsKey } from "../../page";
import { NeedHelpShift } from "../../types";
import DetailLayout from "../DetailLayout";
import ShiftInfo from "../ShiftInfo";
export interface ReviewNeedHelpShiftProps {
  type: NeedHelpShiftTabsKey;
  needHelpShift: NeedHelpShift;
  onClose?: () => void;
  onSuccessful?: () => void;
}

const ReviewSwapsShift = (props: ReviewNeedHelpShiftProps) => {
  const { type, needHelpShift, onClose, onSuccessful } = props;
  const [submitLoading] = useState(false);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [scheduleDate, setScheduleDate] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
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
  useEventBus("close-schedule", () => {
    setShowSchedule(false);
    events.emit("set-header-select-disable", false);
  });
  const [confirmInfo, setConfirmInfo] = useSetState<{
    loading: boolean;
    open: boolean;
    type: "APPROVED" | "REJECTED";
  }>({
    loading: false,
    open: false,
    type: "APPROVED",
  });
  const setScheduleData = (data: any) => {
    const { startDate, endDate, departmentId } = data;
    if (startDate && endDate) {
      setShowSchedule(true);
      setScheduleDate({
        startDate,
        endDate,
      });
    }
    if (departmentId) events.emit("set-header-department-id", departmentId);
  };
  const batch = async () => {
    try {
      setConfirmInfo({
        loading: true,
      });
      const { code } = await overtimeBatch({
        shiftId: [needHelpShift.shiftId || ""],
        status: confirmInfo.type === "APPROVED" ? "APPROVED" : "REJECT",
        comment,
      });
      if (code === 200) {
        onClose && onClose();
        onSuccessful && onSuccessful();
        if (confirmInfo.type === "REJECTED") {
          toast.success(MESSAGE.reject, { position: "top-center" });
        } else if (confirmInfo.type === "APPROVED") {
          toast.success(MESSAGE.approve, { position: "top-center" });
        }
        useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
      }
    } finally {
      setConfirmInfo({
        loading: false,
      });
    }
  };
  return (
    <>
      {showSchedule && (
        <div className="p-[15px]">
          <ScheduleIndex currentItem={scheduleDate} type={1}></ScheduleIndex>
        </div>
      )}
      {!showSchedule && (
        <DetailLayout
          footerRender={
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
                  setConfirmInfo({ open: true, type: "APPROVED" });
                }}
              >
                Approve
              </CustomButton>
            </div>
          }
        >
          <div>
            <PageTitle title="Shift Details" isClose={false} />
            <ShiftInfo
              currentView={type}
              needHelpShift={needHelpShift}
              setData={setScheduleData}
            ></ShiftInfo>
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
            {needHelpShift.shiftId && (
              <ShiftHistory shiftId={needHelpShift.shiftId}></ShiftHistory>
            )}

            <ConfirmDialog
              btnLoading={confirmInfo.loading}
              open={confirmInfo.open}
              onClose={() => {
                setConfirmInfo({ open: false });
              }}
              onOk={() => {
                batch();
              }}
            >
              {` Are you sure you want to ${
                confirmInfo.type === "APPROVED" ? "approve" : "reject"
              } this request?`}
            </ConfirmDialog>
          </div>
        </DetailLayout>
      )}
    </>
  );
};

export default ReviewSwapsShift;
