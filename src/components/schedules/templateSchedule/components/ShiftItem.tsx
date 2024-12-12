import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo, useCallback, useMemo } from "react";

import { TemplateShift } from "@/api/scheduleTemplates/types";
import { Checkbox } from "@/components/ui/checkbox";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import SixteenHoursIcon from "~/icons/shiftStatus/16hoursIcon.svg";
import DoubleBookedIcon from "~/icons/shiftStatus/DoubleBookedIcon.svg";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";
import TargetExceededIcon from "~/icons/shiftStatus/TargetExceededIcon.svg";

type ViewType = "role" | "employee";

const ShiftItem = (props: {
  selectShiftIds?: string[];
  onSelectShiftId?: (shift: TemplateShift) => void;
  viewType: ViewType;
  disabled: boolean;
  shift: TemplateShift;
  isEmployeeView?: boolean;
  onClick?: () => void;
}) => {
  const {
    selectShiftIds,
    onSelectShiftId,
    viewType = "role",
    disabled = false,
    shift,
    isEmployeeView = false,
    onClick,
  } = props;

  const { zoneAbbr } = useGlobalTime();

  const {
    id,
    shiftId,
    userName,
    startTime,
    endTime,
    workerRoleName,
    workerRoleColor,
    isShowTargetHoursTag,
    isShowOvertimeTag,
    isRepeat,
    isMoreThan16Hours,
  } = shift;

  const isOpen = useMemo(() => {
    return !userName && !isEmployeeView;
  }, [userName]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: "item",
      ...props,
    },
    disabled,
  });

  const TimeRender = useCallback(
    ({ startTime, endTime }: { startTime: string; endTime: string }) => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* <ClockSkeletonIcon height={16} width={16} /> */}
          <span className="text-[15px] pl-[2px]">
            {startTime}
            <span>-</span>
            {`${endTime} (${zoneAbbr})`}
          </span>
        </div>
      );
    },
    [startTime, endTime]
  );

  const getViewContent = useCallback(() => {
    switch (viewType) {
      case "role":
        return (
          <>
            <div
              title={userName}
              className="w-full text-ellipsis whitespace-nowrap text-center overflow-hidden mb-[5px]"
            >
              {userName}
            </div>

            {TimeRender({ startTime, endTime })}
          </>
        );
      case "employee":
        return (
          <>
            <div
              title={workerRoleName}
              className="w-full mb-[5px] text-ellipsis whitespace-nowrap text-center overflow-hidden"
              style={{
                color: workerRoleColor,
              }}
            >
              {workerRoleName}
            </div>
            {TimeRender({ startTime, endTime })}
          </>
        );
      default:
        return null;
    }
  }, [shift]);

  const isChecked = useMemo(() => {
    return (selectShiftIds ?? []).includes(shiftId);
  }, [selectShiftIds]);

  return (
    <div
      onClick={onClick}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={cn(
        "w-full relative select-none border-[1px] border-[#E7EDF1] p-[20px_0] mb-[10px] bg-background rounded-[4px] hover:border-primary transition-colors duration-300 flex flex-col justify-center items-center group",
        isDragging && "opacity-50",
        isOpen && "bg-[#FFFDE9] border-[#FFA336] text-[#FFA336]"
      )}
    >
      {!disabled && (
        <div
          className={cn(
            "absolute left-[2px] top-[2px] bg-[#f1f8fc] items-center justify-center flex"
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Checkbox
            checked={isChecked}
            onClick={() => {
              onSelectShiftId && onSelectShiftId(shift);
            }}
          />
        </div>
      )}

      <div className="absolute right-[5px] top-[5px] flex items-center justify-center">
        {isShowOvertimeTag && <OvertimeIcon width="16px" height="16px" />}
        {isShowTargetHoursTag && (
          <TargetExceededIcon
            className="ml-[7px]"
            width="16px"
            height="16px"
          ></TargetExceededIcon>
        )}

        {isRepeat && (
          <DoubleBookedIcon className="ml-[7px]" width="16px" height="16px" />
        )}
        {isMoreThan16Hours && (
          <SixteenHoursIcon className="ml-[7px]" width="16px" height="16px" />
        )}
      </div>

      {isOpen ? (
        <>
          {TimeRender({ startTime, endTime })}
          <div className="text-[18px] font-[700]">OPEN</div>
        </>
      ) : (
        getViewContent()
      )}
    </div>
  );
};

export default memo(ShiftItem);
