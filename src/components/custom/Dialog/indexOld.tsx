"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

// import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import CloseIcon from "~/icons/CloseIcon.svg";

interface CustomDialogProps {
  loading?: boolean;
  open: boolean;
  title?: string;
  titleWrapperClassName?: string;
  closeIcon?: boolean;
  children: React.ReactNode;
  width?: string | number;
  contentWrapperClassName?: string;
  footer?: React.ReactNode;
  footerWrapperClassName?: string;
  dialogContentClassName?: string;
  overlayClassName?: string;
  onClose?: () => void;
}

const CustomDialog = (props: CustomDialogProps) => {
  const {
    loading,
    open,
    title,
    titleWrapperClassName,
    closeIcon = true,
    children,
    width = 600,
    contentWrapperClassName,
    footer,
    footerWrapperClassName,
    dialogContentClassName,
    overlayClassName,
    onClose,
  } = props;

  const overlay = (
    <div
      className={cn("fixed inset-0 bg-black opacity-50 z-40", overlayClassName)}
    ></div>
  );

  useEffect(() => {
    console.log(open, title);

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {open && createPortal(overlay, document.body)}
      <Dialog modal={false} open={open}>
        <DialogContent
          overlayClassName={overlayClassName}
          aria-describedby="dialog-description"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          className={cn("p-0 w-full max-h-[100vh]", dialogContentClassName)}
          style={{
            width: width,
            maxWidth: "100vw",
            borderRadius: "4px",
          }}
        >
          <DialogHeader className="hidden">
            <DialogTitle>My Title</DialogTitle>

            <DialogDescription>Fixed the warning</DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              "flex flex-row items-center justify-between p-[15px] font-[700]",
              titleWrapperClassName
            )}
            style={{
              width: width,
              maxWidth: "100vw",
            }}
          >
            <div className="text-[18px]">{title ? title : ""}</div>
            {closeIcon && (
              <div className="cursor-pointer" onClick={onClose}>
                <CloseIcon width="16px" height="16px" color="#324664" />
              </div>
            )}
          </div>

          <div
            style={{
              width: width,
              maxWidth: "100vw",
            }}
            className={cn("p-[0_15px_15px]", contentWrapperClassName)}
          >
            {loading ? (
              <div className="h-full flex justify-center items-center">
                <Loader2 className="w-[30px] h-[30px] animate-spin" />
              </div>
            ) : (
              children
            )}
          </div>

          {footer && (
            <div
              className={cn(
                "flex justify-end p-[0_30px_30px_0]",
                footerWrapperClassName
              )}
              style={{
                width: width,
                maxWidth: "100vw",
              }}
            >
              {footer}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomDialog;
