import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo, useMemo, useState } from "react";

import { ScheduleShift } from "@/api/currentSchedule/types";
import { Checkbox } from "@/components/ui/checkbox";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import Sawtooth from "~/images/Sawtooth.svg";

import WeeklyStatusIcon from "./WeeklyStatusIcon";

const ShiftItem = (props: {
  selectShiftIds?: string[];
  onSelectShiftId?: (shift: ScheduleShift) => void;
  shift: ScheduleShift;
  isWeek?: boolean;
  isShowWarning?: boolean;
  notPublished?: boolean;
  isEmployeeView?: boolean;
  type?: "small" | "normal";
  canEdit?: boolean;
  isCrossDayEnd?: boolean;
  isCrossDayStart?: boolean;
  onClick?: () => void;
  statusClick?: (tag: number) => void;
}) => {
  const {
    selectShiftIds,
    onSelectShiftId,
    shift,
    onClick,
    isEmployeeView = true,
    notPublished = false,
    isWeek = false,
    type = "normal",
    statusClick,
    isShowWarning = true,
    canEdit = true,
    isCrossDayEnd = false,
    isCrossDayStart = false,
  } = props;

  const { localMoment, UTCMoment, zoneAbbr } = useGlobalTime();

  const [isHover, setIsHover] = useState(false);

  const isDisabled = useMemo(() => {
    if (localMoment(shift.startTimeUTC).isBefore(localMoment(), "minutes")) {
      return true;
    }
    if (!canEdit) {
      return true;
    }
    if (!isHover) {
      return true;
    }
    return false;
  }, [shift, canEdit, isHover]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: shift.id + shift.timeId,
    data: {
      type: "item",
      shift: {
        ...shift,
        showLeft: isCrossDayStart,
        showRight: isCrossDayEnd,
      },
    },
    disabled: isDisabled,
  });

  const {
    workerRoleColor,
    workerRoleName,
    shiftStartTime,
    shiftEndTime,
    userName,
    id,
    startTimeUTC,
    tags,
  } = shift;

  const isChecked = useMemo(() => {
    return (selectShiftIds ?? []).includes(id);
  }, [selectShiftIds]);

  const isShowCheckbox = useMemo(() => {
    const isBefore = UTCMoment(startTimeUTC).isSameOrBefore(
      localMoment(),
      "minute"
    );
    return !isBefore && canEdit;
  }, [startTimeUTC, canEdit]);

  const isOpen = useMemo(() => {
    return !userName && !isEmployeeView;
  }, [userName]);

  const isEmployeeOpen = useMemo(() => {
    return !userName && isEmployeeView;
  }, [userName]);

  const endTime = useMemo(() => {
    if (isCrossDayEnd && !shift.isCrossDayStart) {
      return "12:00 AM";
    } else {
      return shiftEndTime;
    }
  }, [isCrossDayEnd, shift]);

  const startTime = useMemo(() => {
    if (isCrossDayStart) {
      return "12:00 AM";
    } else {
      return shiftStartTime;
    }
  }, [shift, isCrossDayStart]);

  return (
    <div
      className="flex"
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
    >
      <div
        onClick={onClick}
        ref={setNodeRef}
        style={{
          transition,
          transform: CSS.Translate.toString(transform),
        }}
        {...listeners}
        {...attributes}
        className={cn(
          "w-full relative select-none border-[1px]",
          "border-[#E7EDF1] h-[98px] px-2 mb-[10px] bg-background ",
          "rounded-[4px] hover:border-primary transition-colors",
          " duration-300 flex flex-col justify-center items-center overflow-visible",
          isDragging && "opacity-50",
          (isOpen || isEmployeeOpen) &&
            "bg-[#FFFDE9] border-[#FFA336] text-[#FFA336]",
          tags?.includes(3) && isShowWarning && "border-primary",
          notPublished && " border-[#5AD7CF] text-[#5AD7CF]",
          tags?.includes(4) && "bg-[#f9f4ff] border-[#9747FF]",
          isCrossDayEnd && !shift.isCrossDayStart && "rounded-r-[0px]",
          isCrossDayStart && "rounded-l-[0px]"
        )}
      >
        {isShowCheckbox && (
          <div
            className={cn(
              "absolute left-[2px] top-[2px] w-4 h-4 bg-[#f1f8fc] items-center justify-center flex"
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

        <div
          className={cn(
            "font-[700] mb-[10px] w-full text-ellipsis whitespace-nowrap text-center overflow-hidden text-[16px]",
            type === "small" && "text-[16px]"
          )}
          style={{
            color: isEmployeeView ? workerRoleColor : "",
          }}
        >
          {isEmployeeView ? workerRoleName : userName}
        </div>
        <div className={cn(type === "normal" ? "text-[15px]" : "text-[14px]")}>
          {startTime} - {`${endTime} (${zoneAbbr})`}
        </div>

        {isOpen && <div className="font-[700] mt-[5px] text[18px]">OPEN</div>}

        {isCrossDayStart && (
          <div className="absolute left-[-4px] rotate-180">
            <Sawtooth
              height="96px"
              color={isHover ? "#EB1DB2" : "#919FB4"}
            ></Sawtooth>
          </div>
        )}
        {isCrossDayEnd && !shift.isCrossDayStart && (
          <div className="absolute right-[-4px]">
            <Sawtooth
              height="96px"
              color={isHover ? "#EB1DB2" : "#919FB4"}
            ></Sawtooth>
          </div>
        )}
      </div>
      {isWeek && (
        <WeeklyStatusIcon
          onClick={(data) => {
            statusClick && statusClick(data);
          }}
          tags={shift.tags || []}
        ></WeeklyStatusIcon>
      )}
    </div>
  );
};

export default memo(ShiftItem);
