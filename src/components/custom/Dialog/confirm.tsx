"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";

import CustomButton from "../Button";
import CustomDialog from ".";

interface ConfirmDialogProps {
  loading?: boolean;
  open: boolean;
  title?: string;
  titleWrapperClassName?: string;
  children: React.ReactNode;
  width?: string;
  contentHeight?: string;
  contentWrapperClassName?: string;
  footer?: React.ReactNode;
  footerWrapperClassName?: string;
  dialogContentClassName?: string;
  btnLoading?: boolean;
  cancelText?: string;
  okText?: string;
  middleButton?: boolean;
  middleButtonText?: string;
  isShowCancel?: boolean;
  isShowOk?: boolean;
  okBtnClassName?: string;
  onMiddleButton?: () => void;
  onClose?: () => void;
  onOk?: () => void;
}

const ConfirmDialog = (props: ConfirmDialogProps) => {
  const {
    children,
    cancelText,
    okText,
    title,
    middleButtonText,
    middleButton,
    btnLoading,
    isShowCancel = true,
    isShowOk = true,
    okBtnClassName,
    onMiddleButton,
    onOk,
    onClose,
  } = props;
  let CustomDialogProp = {
    ...props,
    title: title ? title : "Confirmation",
    closeIcon: false,
    width: "600px",
    className: "w-full",
    footerWrapperClassName: "gap-6",
    contentWrapperClassName: "p-[0_30px] rounded-[10px]",
    ...props,
  };

  useEffect(() => {
    if (props.open) {
      toast.dismiss();
    }
  }, [props.open]);

  return (
    <CustomDialog
      {...CustomDialogProp}
      footer={
        <div className="flex gap-6 mt-4">
          {isShowCancel && (
            <CustomButton
              disabled={btnLoading}
              onClick={() => {
                onClose && onClose();
              }}
              variant={"outline"}
              className="min-w-[110px]"
            >
              {cancelText ? cancelText : "Cancel"}
            </CustomButton>
          )}

          {middleButton && (
            <CustomButton
              loading={btnLoading}
              onClick={() => {
                onMiddleButton && onMiddleButton();
              }}
              colorStyle="red"
              className="min-w-[110px]"
            >
              {middleButtonText ? middleButtonText : "Cancel"}
            </CustomButton>
          )}
          {isShowOk && (
            <CustomButton
              loading={btnLoading}
              onClick={() => {
                if (!btnLoading) {
                  onOk && onOk();
                }
              }}
              className={cn("min-w-[110px]", okBtnClassName)}
            >
              {okText ? okText : "Yes"}
            </CustomButton>
          )}
        </div>
      }
    >
      <div className="w-full leading-10">{children}</div>
    </CustomDialog>
  );
};

export default ConfirmDialog;
