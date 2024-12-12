import React, { useEffect } from "react";

import { cn } from "@/lib/utils";
import ErrorIcon from "~/icons/ErrorIcon.svg";
interface PromptBoxProps {
  open: boolean;
  content: string;
  className?: string;
  style?: React.CSSProperties;
  isAutoClose?: boolean;
  isShowCloseIcon?: boolean;
  onClose?: () => void;
}
const PromptBox = (props: PromptBoxProps) => {
  const {
    open,
    content,
    className,
    style,
    isAutoClose = false,
    isShowCloseIcon = false,
    onClose,
  } = props;
  const timeRef = React.useRef<any>(null);

  useEffect(() => {
    if (isAutoClose && open) {
      timeRef.current = setTimeout(() => {
        onClose && onClose();
      }, 10 * 1000);
    }
  }, [open, isAutoClose]);
  return (
    <>
      {open && (
        <div
          className={cn(
            "min-h-6 px-2 flex items-center gap-2 flex-wrap",
            className
          )}
          style={style}
        >
          <span> {content}</span>
          {isShowCloseIcon && (
            <ErrorIcon
              onClick={() => {
                if (timeRef.current) {
                  clearTimeout(timeRef.current);
                }
                onClose && onClose();
              }}
              className="cursor-pointer"
              width="12"
              height="12"
            ></ErrorIcon>
          )}
        </div>
      )}
    </>
  );
};

export default PromptBox;
