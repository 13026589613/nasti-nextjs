import { Target } from "@interactjs/core/types";
import interact from "interactjs";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TemplateShift } from "@/api/scheduleTemplates/types";
import { formatDate, getDateString } from "@/components/schedules/utils";
import { Checkbox } from "@/components/ui/checkbox";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";

import { gridSize } from "..";
import { onDragStopCallback, onResizeStopCallback } from "../types";

interface ShiftItemProps {
  selectShiftIds?: string[];
  onSelectShiftId?: (shift: TemplateShift) => void;

  hourWidth: number;
  shift: TemplateShift;
  onDragStop: onDragStopCallback;
  onResizeStop: onResizeStopCallback;
  onClick?: () => void;

  enabled?: boolean;
}

const ShiftItem = (props: ShiftItemProps) => {
  let {
    selectShiftIds,
    onSelectShiftId,
    hourWidth,
    shift,
    onDragStop,
    onResizeStop,
    onClick,
    enabled = true,
  } = props;

  const { localMoment, zoneAbbr } = useGlobalTime();

  let { id, userName, workerRoleColor, workerRoleName, startTime, endTime } =
    shift;

  const isOpen = useMemo(() => {
    return !userName;
  }, [userName]);

  // Calculate X based on start time and end time
  const shiftPositionX = useMemo(() => {
    const start = localMoment(startTime, "MM/DD/YYYY HH:mm");
    const end = localMoment(
      `${getDateString(startTime, "MM/DD/YYYY HH:mm")} 00:00`,
      "MM/DD/YYYY HH:mm"
    );
    const diffM = start.diff(end, "minutes");
    return (diffM / 60) * hourWidth;
  }, [startTime, hourWidth]);

  // Depending on start time and end time Width
  // Because the container is divided into 24-hour sections, the width calculation needs to be converted to a 24-hour system.
  const shiftWidth = useMemo(() => {
    const isNextDay = localMoment(endTime, "MM/DD/YYYY HH:mm").isAfter(
      localMoment(startTime, "MM/DD/YYYY HH:mm"),
      "day"
    );
    const start = localMoment(startTime, "MM/DD/YYYY HH:mm");
    let end = localMoment(endTime, "MM/DD/YYYY HH:mm");
    if (isNextDay) {
      end = localMoment(
        `${getDateString(startTime, "MM/DD/YYYY HH:mm")} 23:59:59`,
        "MM/DD/YYYY HH:mm"
      );
    }

    const diffM = end.diff(start, "minutes");

    return (diffM / 60) * hourWidth;
  }, [startTime, endTime, hourWidth]);

  // Dynamic computational grid
  const gridPixelSize = useMemo(() => hourWidth * (gridSize / 60), [hourWidth]);

  const itemRef = useRef<HTMLDivElement>(null);

  const [showStartTime, setShowStartTime] = useState(startTime);
  const [showEndTime, setShowEndTime] = useState(endTime);

  useEffect(() => {
    if (startTime !== showStartTime) {
      setShowStartTime(startTime);
    }

    if (endTime !== showEndTime) {
      setShowEndTime(endTime);
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

    const parent = target.parentElement?.getBoundingClientRect();

    if (!parent) return;

    const targetRect = target.getBoundingClientRect();

    const elementWidth = event.rect.width;

    // Calculate new position
    let newX = parseFloat(target.getAttribute("data-x") ?? "0") + event?.dx;

    // Ensure the element stays within the parent boundaries
    if (newX < 0) {
      newX = 0;
    } else if (newX + targetRect.width > parent.width) {
      newX = parent.width - targetRect.width;
    }

    // Translate the element
    target.style.transform = `translate(${newX}px, 5px)`;

    // Update the data attributes
    target.setAttribute("data-x", `${newX}`);

    setShowStartTime(getNewTime(newX));
    // x + width = end time position x
    setShowEndTime(getNewTime(newX + elementWidth));
  };

  const handleDragStop = (event: {
    currentTarget: HTMLElement;
    rect: { width: any };
  }) => {
    const target = event.currentTarget as HTMLElement;

    const elementWidth = event.rect.width;

    // Calculate new position
    const x = parseFloat(target.getAttribute("data-x") ?? "0");

    setIsDragging(false);

    onDragStop(
      {
        newStartTime: getNewTime(x),
        newEndTime: getNewTime(x + elementWidth),
      },
      shift
    );
  };

  const handleResizeStart = () => {
    setIsDragging(true);
  };

  const getNewTime = (x: number) => {
    // Get the pixel width of an hour
    const movedHours = x / hourWidth;
    // Get the pixel value of the moving minute
    const movedMinutes = Math.round(movedHours * 60);

    const newTime = localMoment(
      `${getDateString(startTime, "MM/DD/YYYY HH:mm")} 00:00`,
      "MM/DD/YYYY HH:mm"
    )
      .add(movedMinutes, "minutes")
      .format("MM/DD/YYYY HH:mm");

    return newTime;
  };

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
      setShowStartTime(getNewTime(x));
    } else if (direction === "right") {
      setShowEndTime(getNewTime(x + elementWidth));
    }
  };

  const handleResizeStop = (event: {
    target: { dataset: { x: string } };
    rect: { width: any };
  }) => {
    setIsDragging(false);

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
          edges: { left: true, right: true, bottom: false, top: false },
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
              max: { width: 16 * hourWidth, height: 30 },
            }),
          ],
          listeners: {
            start: handleResizeStart,
            move: handleResize,
            end: handleResizeStop,
          },
        })
        .on("tap", (e) => {
          // Prevent the click event from being triggered when dragging

          switch (e.target.nodeName) {
            case "DIV":
              if (enabled) {
                onClick && onClick();
              }
              break;
            // checkbox event
            case "BUTTON":
              break;
            case "SPAN":
              if (enabled) {
                onClick && onClick();
              }
              break;
            default:
              break;
          }
        });
    },
    [gridPixelSize]
  );

  useEffect(() => {
    const itemElement = itemRef.current;
    if (!itemElement) return;

    initInteract(itemElement);

    return () => {
      interact(itemElement).unset();
    };
  }, [initInteract]);

  const getTitle = useMemo(() => {
    const time = `${formatDate(
      showStartTime,
      "hh:mm A",
      "MM/DD/YYYY HH:mm"
    )} - ${formatDate(
      showEndTime,
      "hh:mm A",
      "MM/DD/YYYY HH:mm"
    )} (${zoneAbbr})`;

    return `${userName ? userName : "OPEN"} ${workerRoleName} ${time}`;
  }, [showStartTime, showEndTime, zoneAbbr, userName, workerRoleName]);

  const isChecked = useMemo(() => {
    return (selectShiftIds ?? []).includes(id);
  }, [selectShiftIds]);

  return (
    <div
      ref={itemRef}
      className={cn(
        "select-none rounded-[15px] shadow-md border-[1px] border-[transparent] transition-colors duration-300 z-[1] absolute bg-[#eff8fd] h-[30px] text-[#324664] p-[0_5px]",
        !isDragging && "hover:border-primary",
        isDragging && "z-[2] border-primary",
        isOpen && "bg-[#FFFDE9] border-[#FFA336] text-[#FFA336]"
      )}
      data-x={shiftPositionX}
      style={{
        width: shiftWidth,
        transform: `translate(${shiftPositionX}px, 5px)`,
        cursor: isDragging ? "move" : "pointer",
      }}
      title={getTitle}
    >
      <div
        className={cn(
          "text-[16px] text-center leading-[28px] whitespace-nowrap overflow-hidden text-ellipsis relative group pl-6",
          {
            "cursor-move": isDragging,
            "cursor-pointer": !isDragging,
          }
        )}
      >
        {enabled && (
          <div
            className={cn(
              "absolute left-[4px] top-[6px] bg-[#f1f8fc] items-center justify-center flex"
            )}
          >
            <Checkbox
              checked={isChecked}
              onClick={() => {
                onSelectShiftId && onSelectShiftId(shift);
              }}
            />
          </div>
        )}

        {isOpen && <span>OPEN</span>}

        {!isOpen && <span>{userName}</span>}

        {workerRoleName && (
          <span
            className="ml-[10px]"
            style={{
              color: workerRoleColor,
            }}
          >
            {workerRoleName}
          </span>
        )}

        <span className="ml-[10px]">
          <span>
            {formatDate(showStartTime, "hh:mm A", "MM/DD/YYYY HH:mm")}
          </span>
          <span>-</span>
          <span>{`${formatDate(
            showEndTime,
            "hh:mm A",
            "MM/DD/YYYY HH:mm"
          )} (${zoneAbbr})`}</span>
        </span>
      </div>
    </div>
  );
};

export default memo(ShiftItem);
