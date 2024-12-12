import "rc-dialog/assets/index.css";
import "./dialog.sass";

import { Loader2 } from "lucide-react";
import Dialog from "rc-dialog";

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
  onClose?: () => void;
}

const NewDialog = (props: CustomDialogProps) => {
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
    onClose,
  } = props;

  return (
    <Dialog
      visible={open}
      title={title}
      classNames={{
        wrapper: "custom-dialog-top",
      }}
      style={{
        width: width,
        maxWidth: "100vw",
        borderRadius: "4px",
      }}
      styles={{
        header: {
          display: "none",
        },
        mask: {
          backgroundColor: "rgba(0, 0, 0, .7)",
        },
      }}
      keyboard={false}
      maskClosable={false}
      closable={false}
      onClose={onClose}
    >
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
    </Dialog>
  );
};

export default NewDialog;
