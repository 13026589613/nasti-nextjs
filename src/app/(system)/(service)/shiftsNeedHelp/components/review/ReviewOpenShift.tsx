import { useSetState } from "ahooks";
import { useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  isSomeOneClaimedOpenShift,
  reviewShiftClaimRequest,
} from "@/api/shiftsThatNeedHelp/callOffShift";
import CustomButton from "@/components/custom/Button";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import { FormItem, FormLabel } from "@/components/FormComponent";
import PageTitle from "@/components/PageTitle";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import useMenuNumStore from "@/store/useMenuNumStore";

import ShiftHistory from "../../../currentSchedule/components/ShiftHistory";
import { NeedHelpShift } from "../../types";
import DetailLayout from "../DetailLayout";
import ShiftInfo from "../ShiftInfo";

export interface ReviewNeedHelpShiftProps {
  needHelpShift: NeedHelpShift;

  onClose?: () => void;
  onSuccessful?: () => void;
}

const ReviewOpenShift = (props: ReviewNeedHelpShiftProps) => {
  const { needHelpShift, onClose, onSuccessful } = props;

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

  const [confirmNext, setConfirmNext] = useSetState({
    open: false,
    loading: false,
    name: "",
  });

  const reviewShift = async (type: "APPROVED" | "REJECT") => {
    try {
      if (confirmNext.open) {
        setConfirmNext({ loading: true });
      } else {
        setConfirmInfo({ loading: true });
      }
      const res = await reviewShiftClaimRequest({
        id: needHelpShift.id,
        comment: comment,
        status: type,
      });

      if (res.code === 200) {
        toast.success(type === "APPROVED" ? MESSAGE.approve : MESSAGE.reject);
        useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
        onSuccessful && onSuccessful();
      }
    } finally {
      setConfirmNext({ loading: false, open: false });
      setConfirmInfo({ loading: false, open: false });
    }
  };

  const isSomeOneClaimedOpenShiftFn = async () => {
    try {
      setConfirmInfo({ loading: true });
      const res = await isSomeOneClaimedOpenShift(needHelpShift.id);
      if (res.code === 200 && res.data) {
        if (res.data.length === 0) {
          reviewShift("APPROVED");
          setConfirmInfo({ open: false, loading: false });
        } else {
          let name = "";
          res.data.map((item, index) => {
            if (index === 0) {
              name += item.claimUsername;
            } else if (index === res.data.length - 1) {
              name += " and " + item.claimUsername;
            } else {
              name += ", " + item.claimUsername;
            }
          });
          setConfirmNext({
            open: true,
            name: name,
          });
        }
      }
    } finally {
      setConfirmInfo({ loading: false });
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
        </>
      }
    >
      <>
        {" "}
        <PageTitle title="Shift Details" isClose={false} />
        <ShiftInfo
          currentView={"openShiftClaims"}
          needHelpShift={needHelpShift}
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
      </>
      <ShiftHistory shiftId={needHelpShift.shiftId || ""}></ShiftHistory>

      <ConfirmDialog
        btnLoading={confirmInfo.loading}
        open={confirmInfo.open}
        onClose={() => {
          setConfirmInfo({ open: false });
        }}
        onOk={() => {
          if (confirmInfo.type === "APPROVED") {
            isSomeOneClaimedOpenShiftFn();
          } else {
            reviewShift(
              confirmInfo.type === "REJECTED" ? "REJECT" : "APPROVED"
            );
          }
        }}
      >
        {` Are you sure you want to ${
          confirmInfo.type === "APPROVED" ? "approve" : "reject"
        } this request?`}
      </ConfirmDialog>
      <ConfirmDialog
        btnLoading={confirmNext.loading}
        open={confirmNext.open}
        onClose={() => {
          setConfirmNext({ open: false });
        }}
        onOk={() => {
          reviewShift(confirmInfo.type === "REJECTED" ? "REJECT" : "APPROVED");
        }}
      >
        {`${confirmNext.name} also claimed this 
shift. Approving this request means all the other requests will be 
automatically rejected. Are you sure you want to approve this 
request?`}
      </ConfirmDialog>
    </DetailLayout>
  );
};

export default ReviewOpenShift;
