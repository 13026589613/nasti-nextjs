"use client";
import React, { useState } from "react";

import Tooltip from "@/components/custom/Tooltip";
import { cn } from "@/lib/utils";
import { hexToRgba, isBlackRange } from "@/utils/hexToRgba";
import BottomArrow from "~/icons/BottomArrow.svg";
import DownArrowTriangleIcon from "~/icons/DownArrowTriangleIcon.svg";

type CollapsiblePanelProps = {
  className?: string;
  defaultOpen?: boolean;
  title: string;
  children: React.ReactNode;
  isTriangleIcon?: boolean;
  roleColor?: string;
  isShowAddButton?: boolean;
  contentClassName?: string;
  rightRender?: React.ReactNode;
  centerRender?: React.ReactNode;
  beforeTitle?: React.ReactNode;
  onAddShiftClick?: () => void;
};

function CollapsiblePanel(props: CollapsiblePanelProps) {
  const {
    className,
    defaultOpen,
    title,
    children,
    isTriangleIcon,
    roleColor,
    isShowAddButton,
    contentClassName,
    rightRender,
    centerRender,
    beforeTitle,
    onAddShiftClick,
  } = props;
  const [isOpen, setIsOpen] = useState(!!defaultOpen);

  return (
    <div className={className}>
      <div
        className={cn(
          "h-[45px]  flex justify-between items-center",
          roleColor && "pl-[18px]"
        )}
        style={{
          backgroundColor: roleColor,
        }}
      >
        <div className="flex items-center cursor-pointer">
          <span
            className="cursor-pointer flex items-center z-[1]"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            {isTriangleIcon ? (
              <DownArrowTriangleIcon
                height={12}
                width={12}
                color={isOpen ? "#EB1DB2" : "#919FB4"}
                className={cn(
                  "transform transition-transform mr-[9px]",
                  isOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            ) : (
              <BottomArrow
                height={12}
                width={12}
                color={isOpen ? "#EB1DB2" : "#919FB4"}
                className={cn(
                  "transform transition-transform mr-[9px]",
                  isOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            )}

            {beforeTitle}
            <span
              className="font-[700] "
              style={{
                color: isBlackRange(hexToRgba(roleColor || "", 1))
                  ? "#FFF"
                  : "000",
              }}
            >
              {title}
            </span>
          </span>
          {isShowAddButton && (
            <Tooltip content="Add shift">
              <div
                className="ml-[15px] font-[700] text-[24px] text-primary cursor-pointer z-[5]"
                onClick={() => {
                  onAddShiftClick?.();
                }}
              >
                +
              </div>
            </Tooltip>
          )}
        </div>

        {rightRender ? (
          <div
            style={{
              color: isBlackRange(hexToRgba(roleColor || "", 1))
                ? "#FFF"
                : "000",
            }}
          >
            {rightRender}
          </div>
        ) : (
          centerRender && (
            <div className="flex justify-start w-[50%]">{centerRender}</div>
          )
        )}
      </div>

      <div
        className={cn(
          contentClassName,
          isOpen ? "block" : "hidden",
          "w-[100%]"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default CollapsiblePanel;
