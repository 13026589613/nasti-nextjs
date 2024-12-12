import { useSetState } from "ahooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { scheduleShiftInfo, scheduleShiftReview } from "@/api/currentSchedule";
import { ScheduleShift } from "@/api/currentSchedule/types";
import CustomButton from "@/components/custom/Button";
import Dialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import InputReview from "@/components/custom/review/InputReview";
import MultipleInputView from "@/components/custom/review/MultipleInputView";
import { FormItem, FormLabel } from "@/components/FormComponent";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import useGlobalTime from "@/hooks/useGlobalTime";
type AddShiftDialogDialogProps = {
  communityId: string;
  shiftId: string;
  onClose: () => void;
  onSuccess?: (departmentId: string) => void;
  onClear?: (id: string) => void;
};

const ReviewShiftDialog = (props: AddShiftDialogDialogProps) => {
  const { shiftId, onClose, onSuccess } = props;

  const { UTCMoment, zoneAbbr } = useGlobalTime();

  const [dialogLoading, setDialogLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [shiftData, setShiftData] = useState<ScheduleShift | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
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

  const loadGetShiftInfo = () => {
    setDialogLoading(true);

    scheduleShiftInfo(shiftId)
      .then(({ code, data }) => {
        if (code !== 200) return;
        data.shiftDate = UTCMoment(data.startTimeUTC).format("MM/DD/YYYY");
        data.shiftStartTime = UTCMoment(data.startTimeUTC).format("hh:mm A");
        data.shiftEndTime = UTCMoment(data.endTimeUTC).format("hh:mm A");
        setShiftData(data);
      })
      .finally(() => {
        setDialogLoading(false);
      });
  };

  useEffect(() => {
    loadGetShiftInfo();
  }, []);

  const [confirmInfo, setConfirmInfo] = useSetState({
    visible: false,
    isReject: false,
    loading: false,
  });

  const scheduleShiftReviewFn = async (status: string) => {
    setConfirmInfo({ visible: false });
    setSubmitLoading(true);
    try {
      const res = await scheduleShiftReview({
        shiftId: shiftId,
        comment: comment ? comment : null,
        status,
      });
      if (res.code === 200) {
        toast.success(status === "REJECT" ? MESSAGE.reject : MESSAGE.approve);
        onClose();
        onSuccess && onSuccess((shiftData as ScheduleShift).departmentId);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog
      open
      width="550px"
      title={"Review Shift"}
      onClose={onClose}
      loading={dialogLoading}
      footer={
        <div>
          <CustomButton
            onClick={onClose}
            variant={"outline"}
            className="w-[110px]"
            disabled={submitLoading}
          >
            Cancel
          </CustomButton>

          <CustomButton
            loading={submitLoading}
            className="w-[110px] ml-[22px]"
            colorStyle="red"
            onClick={() => {
              if (comment.trim() === "") {
                setError("comment", {
                  message: "This field is required.",
                });
                return;
              }
              setConfirmInfo({ visible: true, isReject: true });
            }}
          >
            Reject
          </CustomButton>
          <CustomButton
            loading={submitLoading}
            className="w-[110px] ml-[22px]"
            colorStyle="green"
            onClick={handleSubmit((data) => {
              setConfirmInfo({ visible: true, isReject: false });
            })}
          >
            Approve
          </CustomButton>
        </div>
      }
      contentWrapperClassName="pr-1"
    >
      <div className="overflow-y-auto overflow-x-hidden w-full h-[calc(100vh-180px)] pr-3 pb-4">
        <InputReview
          label="Department"
          value={shiftData?.departmentName}
        ></InputReview>

        <MultipleInputView
          label="Location"
          value={shiftData?.locationRefVOs?.map((item) => item.locationName)}
        ></MultipleInputView>

        <InputReview
          label="Role"
          value={shiftData?.workerRoleName}
        ></InputReview>

        <InputReview
          label={`Shift Date (${zoneAbbr})`}
          value={shiftData?.shiftDate}
        ></InputReview>

        <InputReview
          label={`Shift Time (${zoneAbbr})`}
          value={
            <div className="flex items-center gap-4 test-[#666666]">
              <div>{shiftData?.shiftStartTime}</div>-
              <div>{shiftData?.shiftEndTime}</div>
            </div>
          }
        ></InputReview>

        <InputReview label="Employee" value={shiftData?.userName}></InputReview>

        <InputReview label="Notes" value={shiftData?.note}></InputReview>

        <FormLabel label="Please enter a comment">
          <FormItem
            name="comment"
            control={control}
            errors={errors.comment}
            render={({ field: { value, onChange } }) => (
              <Textarea
                rows={4}
                value={value}
                onChange={(e) => {
                  onChange(e);
                  const value = e.target.value;
                  if (value.trim().length > 0) {
                    clearErrors("comment");
                  }
                }}
                placeholder="Comment"
              />
            )}
          />
        </FormLabel>
      </div>
      {confirmInfo.visible && (
        <ConfirmDialog
          open={confirmInfo.visible}
          btnLoading={confirmInfo.loading}
          width="560px"
          onClose={() => {
            setConfirmInfo({ visible: false, loading: false, isReject: false });
          }}
          onOk={() => {
            scheduleShiftReviewFn(confirmInfo.isReject ? "REJECT" : "APPROVED");
          }}
        >
          {`Are you sure you want to ${
            confirmInfo.isReject ? "reject" : "approve"
          } this overtime shift?`}
        </ConfirmDialog>
      )}
    </Dialog>
  );
};
export default ReviewShiftDialog;
