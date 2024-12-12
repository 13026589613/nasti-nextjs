import { useSetState } from "ahooks";
import { useEffect, useMemo, useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { checkTimeOff } from "@/api/timeOff";
import { timeOffInfoResponseVo } from "@/app/(system)/(service)/employees/type";
import CustomButton from "@/components/custom/Button";
import Dialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import InputReview from "@/components/custom/review/InputReview";
import { FormItem, FormLabel } from "@/components/FormComponent";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import useGlobalTime from "@/hooks/useGlobalTime";
import useMenuNumStore from "@/store/useMenuNumStore";

import { TimeOffStatus } from "../type";

type RejectTimeOffDiaProps = {
  open: boolean;
  data: timeOffInfoResponseVo | null;
  type: string;
  onClose: () => void;
  onSuccess: () => void;
};

const ReviewTimeOffDia = (props: RejectTimeOffDiaProps) => {
  const { open, data, type, onClose, onSuccess } = props;

  const { UTCMoment, zoneAbbr } = useGlobalTime();

  const [dialogLoading] = useState(false);
  const [submitLoading] = useState(false);
  const {
    control,
    formState: { errors },
    watch,
    setError,
    setValue,
    clearErrors,
  } = useForm<{
    comment: string;
  }>({
    defaultValues: {
      comment: "",
    },
  });
  useEffect(() => {
    if (!open) setValue("comment", "");
  }, [open]);
  const comment = watch("comment");

  const reasonRef = React.useRef<HTMLTextAreaElement>(null);

  const [confirmInfo, setConfirmInfo] = useSetState<{
    loading: boolean;
    open: boolean;
    type: TimeOffStatus;
  }>({
    loading: false,
    open: false,
    type: "APPROVED",
  });
  const handleTimeOff = (type: TimeOffStatus) => {
    setConfirmInfo({ open: true, type });
  };
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
        setConfirmInfo({ open: false });
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

  return (
    <Dialog
      open={open}
      width="550px"
      title={type == "view" ? "View Time Off" : `Review Time Off`}
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
          {type === "review" && (
            <>
              <CustomButton
                // loading={submitLoading}
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

                    handleTimeOff("REJECTED");
                  }
                }}
              >
                Reject
              </CustomButton>
              <CustomButton
                loading={submitLoading}
                className="w-[110px] ml-[22px]"
                colorStyle="green"
                onClick={() => {
                  handleTimeOff("APPROVED");
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
        {data?.comment && (
          <InputReview
            labelClassName="w-[100px]"
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
        {`Are you sure you want to ${
          confirmInfo.type === "APPROVED" ? "approve" : "reject"
        } this request?`}
      </ConfirmDialog>
    </Dialog>
  );
};
export default ReviewTimeOffDia;
