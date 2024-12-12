import { Target } from "@interactjs/core/types";
import interact from "interactjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getDateString } from "@/components/schedules/utils";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";

import { gridSize } from "../../templateSchedule/package/shiftTimeLine";

export type onDragStopCallback<T> = (
  processData: {
    newStartTime: string;
    newEndTime: string;
  },
  shift: T
) => void;

export type onResizeStopCallback<T> = (
  processData: {
    newStartTime: string;
    newEndTime: string;
  },
  shift: T
) => void;

interface ShiftContainerProps<T> {
  title?: string;
  selectShiftIds?: string[];
  onSelectShiftId?: (id: string) => void;

  hourWidth: number;
  onDragStop: onDragStopCallback<T>;
  onResizeStop: onResizeStopCallback<T>;
  onClick?: () => void;
  enabled?: boolean;
  redBg?: boolean;
  shift: T;

  startTime: string;
  endTime: string;

  children: (
    showStartTime: string,
    showEndTime: string,
    isDragging: boolean,
    showShiftWidthInfo: {
      isLeftCrossDay: boolean;
      isRightCrossDay: boolean;
      width: string;
    }
  ) => React.ReactNode;

  isOpen?: boolean;
  isWarning?: boolean;

  isNotPublished?: boolean;

  isPurple?: boolean;

  dayDate: string;
}

const ShiftContainer = <T,>(props: ShiftContainerProps<T>) => {
  let {
    title,
    hourWidth,
    onDragStop,
    onResizeStop,
    onClick,
    enabled = true,
    startTime, //"MM/DD/YYYY HH:mm"
    endTime, //"MM/DD/YYYY HH:mm"
    shift,
    children,
    redBg,
    isOpen = false,
    isWarning = false,
    isNotPublished = false,
    dayDate,
    isPurple,
  } = props;

  const { localMoment } = useGlobalTime();

  const getCrossDayInfo = (
    startTime: string,
    endTime: string,
    viewDate: string
  ) => {
    const start = localMoment(startTime, "MM/DD/YYYY HH:mm");
    const end = localMoment(endTime, "MM/DD/YYYY HH:mm");

    // Gets the start and end times of the view
    const viewStart = localMoment(`${viewDate} 00:00`, "MM/DD/YYYY HH:mm");
    const viewEnd = localMoment(`${viewDate} 24:00`, "MM/DD/YYYY HH:mm");

    // Determine whether to cross the sky
    const isCrossDay = start.isBefore(end, "day");

    // Determine the left span: startTime is less than the start time of the view
    const isLeftCrossDay = start.isBefore(viewStart);

    // Determine the right span: endTime is greater than the end time of the view
    const isRightCrossDay = end.isAfter(viewEnd);

    return { isLeftCrossDay, isRightCrossDay, isCrossDay };
  };

  // Calculate X based on start time and end time
  const shiftPositionX = useMemo(() => {
    const start = localMoment(startTime, "MM/DD/YYYY HH:mm");

    const { isLeftCrossDay } = getCrossDayInfo(startTime, endTime, dayDate);

    if (isLeftCrossDay) {
      // Calculate the minute difference between startTime and 00:00 of the current day.
      const startOfDay = localMoment(`${dayDate} 00:00`, "MM/DD/YYYY HH:mm");

      const diffM = start.diff(startOfDay, "minutes");

      return (diffM / 60) * hourWidth;
    } else {
      const endOfDay = localMoment(
        `${getDateString(startTime, "MM/DD/YYYY HH:mm")} 00:00`,
        "MM/DD/YYYY HH:mm"
      );
      const diffM = start.diff(endOfDay, "minutes");

      return (diffM / 60) * hourWidth;
    }
  }, [startTime, endTime, hourWidth, dayDate]);

  // Depending on start time and end time Width
  // Because the container is divided into 24-hour sections, the width calculation needs to be converted to a 24-hour system.
  const shiftWidth = useMemo(() => {
    const endMoment = localMoment(endTime, "MM/DD/YYYY HH:mm");
    const startMoment = localMoment(startTime, "MM/DD/YYYY HH:mm");
    const diffM = endMoment.diff(startMoment, "minutes");

    return (diffM / 60) * hourWidth;
  }, [startTime, endTime, hourWidth]);

  // Dynamic computational grid
  const gridPixelSize = useMemo(() => hourWidth * (gridSize / 60), [hourWidth]);

  const itemRef = useRef<HTMLDivElement>(null);

  const [tempShowStartTime, setTempShowStartTime] = useState(startTime);
  const [tempShowEndTime, setTempShowEndTime] = useState(endTime);

  const showStartTime = useMemo(() => {
    const { isLeftCrossDay } = getCrossDayInfo(
      tempShowStartTime,
      tempShowEndTime,
      dayDate
    );

    if (isLeftCrossDay) return `${dayDate} 00:00`;

    return tempShowStartTime;
  }, [tempShowStartTime, tempShowEndTime, dayDate]);

  const showEndTime = useMemo(() => {
    const { isRightCrossDay } = getCrossDayInfo(
      tempShowStartTime,
      tempShowEndTime,
      dayDate
    );

    if (isRightCrossDay) return `${dayDate} 24:00`;

    return tempShowEndTime;
  }, [tempShowStartTime, tempShowEndTime, dayDate]);

  const showShiftWidthInfo = useMemo(() => {
    const { isLeftCrossDay, isRightCrossDay } = getCrossDayInfo(
      tempShowStartTime,
      tempShowEndTime,
      dayDate
    );

    const startMoment = localMoment(tempShowStartTime, "MM/DD/YYYY HH:mm");
    const endMoment = localMoment(tempShowEndTime, "MM/DD/YYYY HH:mm");

    const startOfDay = localMoment(`${dayDate} 00:00`, "MM/DD/YYYY HH:mm");
    const endOfDay = localMoment(`${dayDate} 24:00`, "MM/DD/YYYY HH:mm");

    let width = "";

    if (isRightCrossDay) {
      const diffM = startMoment.diff(endOfDay, "minutes");

      width = `${Math.abs((diffM / 60) * hourWidth)}px`;
    } else if (isLeftCrossDay) {
      const diffM = endMoment.diff(startOfDay, "minutes");

      width = `${Math.abs((diffM / 60) * hourWidth)}px`;
    }

    return {
      isRightCrossDay,
      isLeftCrossDay,
      width,
    };
  }, [tempShowStartTime, tempShowEndTime, dayDate, hourWidth]);

  useEffect(() => {
    if (startTime !== tempShowStartTime) {
      setTempShowStartTime(startTime);
    }

    if (endTime !== tempShowEndTime) {
      setTempShowEndTime(endTime);
    }
  }, [startTime, endTime]);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: {
    currentTarget: HTMLElement;
    rect: { width: any };
    dx: number;
  }) => {
    const target = event.currentTarget as HTMLElement;

    const elementWidth = event.rect.width;

    // Calculate new position
    let newX = parseFloat(target.getAttribute("data-x") ?? "0") + event?.dx;

    // // If newX is less than 0, it means drag across days, allowing it to be negative
    target.style.transform = `translate(${newX}px, 5px)`;

    // Update the data attributes
    target.setAttribute("data-x", `${newX}`);

    const newStartTime = getNewTime(newX);
    const newEndTime = getNewTime(newX + elementWidth);

    // Update the display time
    setTempShowStartTime(newStartTime);
    setTempShowEndTime(newEndTime);
  };

  const handleDragStop = (event: {
    currentTarget: HTMLElement;
    rect: { width: any };
  }) => {
    const target = event.currentTarget as HTMLElement;

    const elementWidth = event.rect.width;

    // Calculate new position
    const x = parseFloat(target.getAttribute("data-x") ?? "0");

    const newStartTime = getNewTime(x);
    const newEndTime = getNewTime(x + elementWidth);

    setTimeout(() => {
      setIsDragging(false);
    }, 100);

    onDragStop(
      {
        newStartTime,
        newEndTime,
      },
      shift
    );
  };

  const handleResizeStart = () => {
    setIsDragging(true);
  };

  const getNewTime = useCallback(
    (x: number) => {
      const movedHours = x / hourWidth;

      // Drag minutes
      const movedMinutes = Math.round(movedHours * 60);

      // The base time should be dayDate 00:00
      const baseTime = localMoment(`${dayDate} 00:00`, "MM/DD/YYYY HH:mm");

      let newTime;

      if (x < 0) {
        // If x is negative, it means that it is necessary to work backward from the base time to calculate the span of days.
        newTime = baseTime.subtract(Math.abs(movedMinutes), "minutes");
      } else {
        // If x is positive, add minutes to the base time.
        newTime = baseTime.add(movedMinutes, "minutes");
      }

      return newTime.format("MM/DD/YYYY HH:mm");
    },
    [dayDate]
  );

  const handleResize = (event: {
    target: { dataset: { x: string }; style: any };
    deltaRect: { left: number };
    rect: { width: any };
  }) => {
    // Processing elements resize Assign value
    const x = parseFloat(event.target.dataset.x) + event.deltaRect.left;
    const elementWidth = event.rect.width;

    Object.assign(event.target.style, {
      width: `${elementWidth}px`,
      transform: `translate(${x}px, 5px)`,
    });

    Object.assign(event.target.dataset, { x });

    const direction = event.deltaRect.left === 0 ? "right" : "left";

    if (direction === "left") {
      setTempShowStartTime(getNewTime(x));
    } else if (direction === "right") {
      setTempShowEndTime(getNewTime(x + elementWidth));
    }
  };

  const handleResizeStop = (event: {
    target: { dataset: { x: string } };
    rect: { width: any };
  }) => {
    setTimeout(() => {
      setIsDragging(false);
    }, 100);

    // Processing elements resize Assign value
    const x = parseFloat(event.target.dataset.x);
    const elementWidth = event.rect.width;

    onResizeStop(
      {
        newStartTime: getNewTime(x),
        newEndTime: getNewTime(x + elementWidth),
      },
      shift
    );
  };

  const initInteract = useCallback(
    (itemElement: Target) => {
      const snapGrid = interact.snappers.grid({
        x: gridPixelSize,
        y: gridPixelSize,
      });

      interact(itemElement)
        .draggable({
          enabled: enabled,
          listeners: {
            start: handleDragStart,
            move: handleDrag,
            end: handleDragStop,
          },
          modifiers: [
            interact.modifiers.snap({
              targets: [snapGrid],
              range: Infinity,
              relativePoints: [{ x: 0, y: 0 }],
              offset: "self",
            }),
          ],
        })
        .resizable({
          enabled: enabled,
          edges: {
            left: true,
            right: true,
            bottom: false,
            top: false,
          },
          modifiers: [
            interact.modifiers.snapSize({
              targets: [snapGrid],
              range: Infinity,
              offset: "self",
            }),
            interact.modifiers.restrictEdges({
              outer: "parent",
            }),
            interact.modifiers.restrictSize({
              min: { width: Math.round(hourWidth / 60), height: 30 },
            }),
          ],
          listeners: {
            start: handleResizeStart,
            move: handleResize,
            end: handleResizeStop,
          },
        });
      // .on("click", (e) => {
      //   const ele = e.target as HTMLElement;
      //   if (ele.getAttribute("data-id") !== "stop-icon") {
      //     onClick?.();
      //   }
      // });
    },
    [gridPixelSize, shift]
  );

  useEffect(() => {
    const itemElement = itemRef.current;
    if (!itemElement) return;

    initInteract(itemElement);

    return () => {
      interact(itemElement).unset();
    };
  }, [initInteract]);

  return (
    <div
      title={title}
      ref={itemRef}
      className={cn(
        "select-none rounded-[15px] shadow-md border-[1px] border-[transparent] transition-colors duration-300 z-[1] absolute bg-[#eff8fd] h-[30px] text-[#324664] p-[0_5px]",
        !isDragging && "hover:border-primary",
        isDragging && "z-[2] border-primary",
        isOpen && "bg-[#FFFDE9] border-[#FFA336] text-[#FFA336]",
        isWarning && "border-primary",
        redBg && "bg-[#F55F4E33]",
        isPurple && "bg-[#9747FF0F] border-[#9747FF]",
        isNotPublished && " border-[#5AD7CF] text-[#5AD7CF]"
      )}
      data-x={shiftPositionX}
      style={{
        width: shiftWidth,
        transform: `translate(${shiftPositionX}px, 5px)`,
        cursor: isDragging ? "move" : "pointer",
      }}
      onClick={() => {
        if (!isDragging) {
          onClick?.();
        }
      }}
    >
      <div
        className={cn(
          "flex justify-center text-[16px] whitespace-nowrap overflow-hidden text-ellipsis relative group",
          {
            "cursor-move": isDragging,
            "cursor-pointer": !isDragging,
          }
        )}
      >
        {children(showStartTime, showEndTime, isDragging, showShiftWidthInfo)}
      </div>
    </div>
  );
};

export default ShiftContainer;
