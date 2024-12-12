"use client";
import { useSetState } from "ahooks";
import React, { memo, useState } from "react";

import { getUserWorkerInfo } from "@/api/user";
import Tooltip from "@/components/custom/Tooltip";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import useUserStore from "@/store/useUserStore";
import { hexToRgba, isBlackRange } from "@/utils/hexToRgba";
import BottomArrow from "~/icons/BottomArrow.svg";
import DownArrowTriangleIcon from "~/icons/DownArrowTriangleIcon.svg";

import { WeeklyDaysType } from "../../types/weekly";

type CollapsiblePanelProps = {
  className?: string;
  defaultOpen?: boolean;
  title: string;
  children: React.ReactNode;
  isTriangleIcon?: boolean;
  roleColor: string;
  weeklyDays?: WeeklyDaysType[];
  contentClassName?: string;
  roleId?: string;
  isHoverCard?: boolean;
  hoverCardId?: string;
  hoverShowAddKey?: string;
  showAddKey?: string;
  isShadow?: boolean;
  showAddBtn?: boolean;
  beforeTitle?: React.ReactNode;
  onAddShiftClick?: (weeklyDays: WeeklyDaysType) => void;
};

function CollapsiblePanel(props: CollapsiblePanelProps) {
  const {
    className,
    defaultOpen,
    title,
    children,
    isTriangleIcon,
    roleColor,
    weeklyDays,
    contentClassName,
    isHoverCard,
    hoverCardId,
    isShadow = true,
    showAddBtn = true,
    beforeTitle,
    onAddShiftClick,
  } = props;

  const { localMoment } = useGlobalTime();

  const [isOpen, setIsOpen] = useState(!!defaultOpen);

  const [userWorkInfo, setUserWorkInfo] = useSetState({
    license: "",
    roles: "",
  });

  const communityId = useUserStore((state) => state.operateCommunity?.id || "");

  const handleHoverCardChange = (isOpen: boolean) => {
    if (isOpen && hoverCardId && communityId) {
      getUserWorkerInfo(hoverCardId, communityId).then(({ code, data }) => {
        if (code !== 200) return;

        const { license, roles } = data;

        setUserWorkInfo({
          license: license ?? "",
          roles: roles.map((item) => item.name).join(", ") ?? "",
        });
      });
    } else {
      setUserWorkInfo({
        license: "",
        roles: "",
      });
    }
  };

  return (
    <div className={className}>
      <div
        className={cn(
          "h-[45px] flex items-center relative bg-background",
          isShadow && "shadow-md"
        )}
        style={{
          backgroundColor: roleColor,
        }}
      >
        <div
          className={cn(
            "absolute left-0 cursor-pointer flex items-center z-[1]",
            roleColor && "pl-[18px]",
            !!weeklyDays?.length && "w-[160px]"
          )}
          onClick={() => setIsOpen(!isOpen)}
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

          <div className="flex-1 font-[700] text-[#324664] select-none overflow-hidden text-ellipsis whitespace-nowrap">
            {isHoverCard ? (
              <Tooltip
                side={"top"}
                align={"start"}
                onOpenChange={handleHoverCardChange}
                classContentName="bg-background shadow-xl p-[15px] font-[400]"
                content={
                  <>
                    <div>
                      License:
                      <span className="text-[#949fb2] ml-[5px]">
                        {userWorkInfo.license}
                      </span>
                    </div>

                    <div>
                      Role:
                      <span className="text-[#949fb2] ml-[5px]">
                        {userWorkInfo.roles}
                      </span>
                    </div>
                  </>
                }
              >
                <span title={title}>{title}</span>
              </Tooltip>
            ) : (
              <div className="flex items-center">
                {beforeTitle}
                <div
                  className="w-full select-none overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{
                    color: isBlackRange(hexToRgba(roleColor, 1))
                      ? "#FFF"
                      : "000",
                  }}
                  title={title}
                >
                  {title}
                </div>
              </div>
            )}
          </div>
        </div>

        {showAddBtn && (
          <div className="pl-[100px] flex-1 flex">
            {weeklyDays?.map((item) => {
              const { date, dayOfWeek } = item;
              const isBeforeToday = date
                ? localMoment(date, "MM/DD/YYYY").isBefore(localMoment(), "day")
                : false;

              return (
                <div
                  key={date || dayOfWeek}
                  className={cn("h-[40px] text-center")}
                  style={{
                    width: "calc(100% / 7)",
                    minWidth: "calc(100% / 7)",
                    maxWidth: "calc(100% / 7)",
                  }}
                >
                  {!isBeforeToday && (
                    <div className="z-[5]">
                      <Tooltip content="Add shift">
                        <span
                          className="font-[700] text-[24px] text-primary cursor-pointer"
                          onClick={() => {
                            onAddShiftClick && onAddShiftClick(item);
                          }}
                        >
                          +
                        </span>
                      </Tooltip>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isOpen && <div className={contentClassName}>{children}</div>}
    </div>
  );
}

export default memo(CollapsiblePanel);
