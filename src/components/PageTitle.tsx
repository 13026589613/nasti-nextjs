"use client";
import { cn } from "@/lib/utils";
import CoarseClose from "~/icons/CoarseClose.svg";

import Tooltip from "./custom/Tooltip";

type PageTitleProps = {
  title: string;
  isClose?: boolean;
  rightRender?: React.ReactNode;
  rightClick?: () => void;

  className?: string;
  titleClassName?: string;
  rightClassName?: string;
};

const PageTitle = (props: PageTitleProps) => {
  const {
    title,
    isClose = true,
    rightRender,
    rightClick,
    className,
    titleClassName,
    rightClassName,
  } = props;
  return (
    <div className={cn("flex justify-between", className)}>
      <div
        className={cn("text-[24px] font-[450] text-[#324664]", titleClassName)}
      >
        {title}
      </div>
      <div className={cn("cursor-pointer", rightClassName)}>
        {rightRender
          ? rightRender
          : isClose && (
              <Tooltip content="Close">
                <CoarseClose
                  height="32px"
                  width="32px"
                  color="#919FB4"
                  onClick={rightClick}
                />
              </Tooltip>
            )}
      </div>
    </div>
  );
};

export default PageTitle;
