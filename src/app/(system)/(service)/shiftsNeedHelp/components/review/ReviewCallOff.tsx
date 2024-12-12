import { useSetState } from "ahooks";
import { useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { approvalCallOffShift } from "@/api/shiftsThatNeedHelp/callOffShift/index";
import {
  CallOffActionReq,
  CallOffOrUFGRes,
} from "@/app/(system)/(service)/shiftsNeedHelp/types";
import CustomButton from "@/components/custom/Button";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import { FormItem, FormLabel } from "@/components/FormComponent";
import PageTitle from "@/components/PageTitle";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import useMenuNumStore from "@/store/useMenuNumStore";

import ShiftHistory from "../../../currentSchedule/components/ShiftHistory";
import ApproveAndReassignDia from "../ApproveAndReassignDia";
import DetailLayout from "../DetailLayout";
import ShiftInfo from "../ShiftInfo";

export interface ReviewNeedHelpShiftProps {
  needHelpShift: CallOffOrUFGRes;

  onClose?: () => void;
  onSuccessful?: () => void;
}

const ReviewCallOff = (props: ReviewNeedHelpShiftProps) => {
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

  const [rejectInfo, setRejectInfo] = useSetState<{
    loading: boolean;
    open: boolean;
  }>({
    loading: false,
    open: false,
  });

  const [unassignInfo, setUnassignInfo] = useSetState<{
    loading: boolean;
    open: boolean;
  }>({
    loading: false,
    open: false,
  });

  const [reassignConfirm, setReassignConfirm] = useState(false);

  const handleSubmitApproveUnassign = () => {
    handleSubmitResult(1, "");
  };
  const handleSubmitApproveAssignUser = (employeeId: string) => {
    handleSubmitResult(2, employeeId);
  };
  const handleSubmitReject = () => {
    handleSubmitResult(0, "");
  };
  const handleSubmitResult = (type: number, targetUserId: string) => {
    const params: CallOffActionReq = {
      actionType: type,
      shiftId: needHelpShift.shiftId,
      id: needHelpShift.id,
      targetUserId: targetUserId,
      sourceUserId: needHelpShift.userId,
      reviewComment: comment,
    };
    approvalCallOffShift(params)
      .then((res) => {
        if (res.code === 200 && res.data === true) {
          setUnassignInfo({ open: false });
          setRejectInfo({ open: false });
          setReassignConfirm(false);

          if (type === 0) {
            toast.success(MESSAGE.reject, { position: "top-center" });
          } else if (type === 1) {
            toast.success(MESSAGE.approve, { position: "top-center" });
          } else if (type === 2) {
            toast.success(MESSAGE.approve, { position: "top-center" });
          }

          useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
          onClose && onClose();
          onSuccessful && onSuccessful();
        }
      })
      .finally(() => {});
  };

  return (
    <DetailLayout
      footerRender={
        <>
          {" "}
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
                setRejectInfo({ open: true });
              }
            }}
          >
            Reject
          </CustomButton>
          <CustomButton
            className="ml-[22px]"
            colorStyle="green"
            onClick={() => {
              setUnassignInfo({ open: true });
            }}
          >
            Approve & Unassign
          </CustomButton>
          <CustomButton
            className="ml-[22px]"
            colorStyle="green"
            onClick={() => {
              setReassignConfirm(true);
            }}
          >
            Approve & Re-assign
          </CustomButton>
        </>
      }
    >
      <PageTitle title="Shift Details" isClose={false} />
      <ShiftInfo
        currentView={"callOffs"}
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
      <ShiftHistory shiftId={needHelpShift.shiftId}></ShiftHistory>

      <ConfirmDialog
        btnLoading={rejectInfo.loading}
        open={rejectInfo.open}
        onClose={() => {
          setRejectInfo({ open: false });
        }}
        onOk={() => {
          handleSubmitReject();
        }}
      >
        {`Are you sure you want to reject this request?`}
      </ConfirmDialog>

      <ConfirmDialog
        btnLoading={unassignInfo.loading}
        open={unassignInfo.open}
        onClose={() => {
          setUnassignInfo({ open: false });
        }}
        onOk={() => {
          handleSubmitApproveUnassign();
        }}
      >
        {`Are you sure you want to approve this call-off request and then unassign this shift?`}
      </ConfirmDialog>
      {reassignConfirm && (
        <ApproveAndReassignDia
          roleId={needHelpShift.roleId}
          open={reassignConfirm}
          departmentIds={needHelpShift.departmentId}
          userId={needHelpShift.userId}
          onClose={() => {
            setReassignConfirm(false);
          }}
          onSuccessful={async (employee) => {
            setReassignConfirm(false);
            await handleSubmitApproveAssignUser(employee);

            return true;
          }}
        ></ApproveAndReassignDia>
      )}
    </DetailLayout>
  );
};

export default ReviewCallOff;
