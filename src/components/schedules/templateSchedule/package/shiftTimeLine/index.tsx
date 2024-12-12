import { cloneDeep } from "lodash";
import { memo, useCallback, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { ShiftTime, TemplateShift } from "@/api/scheduleTemplates/types";
import { onAddShiftClickFn } from "@/app/(system)/(service)/scheduleTemplates/edit/components/ScheduleTemplateViews";
import useSize from "@/components/schedules/hooks/useSize";
import {
  handleTimeToDateTime,
  sortStartWeek,
} from "@/components/schedules/utils";
import useGlobalTime from "@/hooks/useGlobalTime";
import useAuthStore from "@/store/useAuthStore";

import Header from "./components/Header";
import RowContainer from "./components/RowContainer";
import ShiftItem from "./components/ShiftItem";
import { onDragStopCallback, onResizeStopCallback } from "./types";

export interface MoveInfoType {
  movedHours: number;
  movedMinutes: number;
  roundedMinutes: number;
}

interface ShiftTimeLineProps {
  selectShiftIds?: string[];
  onSelectShiftId?: (shift: TemplateShift) => void;
  startOfWeek: string;
  enabled?: boolean;
  data: ShiftTime[];
  dayHours: string[];
  onDragStop: onDragStopCallback;
  onResizeStop: onResizeStopCallback;
  onShiftItemClick?(shift: TemplateShift): void;
  onAddShiftClick: onAddShiftClickFn;
}

const dayOfWeekToStringMaps: {
  [key: number]: string;
} = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

// 15 minutes
export const gridSize = 15;

const ShiftTimeLine: React.FC<ShiftTimeLineProps> = (props) => {
  const {
    selectShiftIds,
    onSelectShiftId,
    startOfWeek = "MONDAY",
    enabled = true,
    data,
    dayHours,
    onDragStop,
    onResizeStop,
    onShiftItemClick,
    onAddShiftClick,
  } = props;

  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const { localMoment } = useGlobalTime();

  const canAdd = useMemo(() => {
    return permission.includes("TEMPLATE_MANAGEMENT_ADD");
  }, [permission]);

  const canEdit = useMemo(() => {
    return permission.includes("TEMPLATE_MANAGEMENT_EDIT");
  }, [permission]);

  const wrapperRef = useRef(null);

  const wrapperWidth = useSize(wrapperRef)?.width || 0;

  const hourWidth = useMemo(() => {
    return Math.round((wrapperWidth - 100) / 24);
  }, [wrapperWidth]);

  const contentWidth = useMemo(() => {
    return hourWidth * 24;
  }, [hourWidth]);

  // Used to generate shift arrays into multidimensional arrays with multiple rows.
  // result：[[shift1, shift2], [shift3, shift4], [shift5, shift6]]
  const getRowsByShifts = useCallback((shifts: TemplateShift[]) => {
    const copyShifts = [...shifts];

    /*
      Sorting rules:
      If there is no userName (OPEN), it is on top.
      If there is a userName, sort by userName.
    */
    copyShifts.sort((a, b) => {
      if (a.workerRoleName && b.workerRoleName) {
        return a.workerRoleName.localeCompare(b.workerRoleName);
      } else if (a.workerRoleName && !b.workerRoleName) {
        return 1;
      } else if (!a.workerRoleName && b.workerRoleName) {
        return -1;
      } else if (!a.workerRoleName && !b.workerRoleName) {
        return a.id.localeCompare(b.id);
      }

      return 0;
    });

    let shiftRows: Array<TemplateShift[]> = [[]];

    copyShifts.forEach((shift) => {
      let placed = false;
      for (let row of shiftRows) {
        if (
          !row.some(
            (s) => s.startTime < shift.endTime && shift.startTime < s.endTime
          )
        ) {
          row.push(shift);
          placed = true;
          break;
        }
      }

      if (!placed) {
        shiftRows.push([shift]);
      }
    });

    return shiftRows;
  }, []);

  const fillShiftDay = useCallback((shifts: ShiftTime[]) => {
    const newShifts = [...shifts];

    const daysOfWeek = Array.from({ length: 7 }, (_, i) => i + 1);

    return daysOfWeek.map((day) => {
      return (
        newShifts.find((item) => item.dayOfWeek === day) || {
          dayOfWeek: day,
          shifts: [],
        }
      );
    });
  }, []);

  return (
    <div className="relative overflow-hidden mt-[20px]" ref={wrapperRef}>
      {!!wrapperWidth && (
        <div className="border-[1px] border-[#E7EDF1] relative">
          <Header dayHours={dayHours} contentWidth={contentWidth} />

          {data &&
            (
              sortStartWeek(
                startOfWeek,
                fillShiftDay(data || [])
              ) as ShiftTime[]
            ).map(({ dayOfWeek, shifts }) => {
              const shiftData = cloneDeep(shifts).map((shift) => {
                const { startTime, endTime } = handleTimeToDateTime(
                  shift.startTime,
                  shift.endTime,
                  "hh:mm A"
                );

                return {
                  ...shift,
                  startTime,
                  endTime,
                };
              });

              let tooltip: {
                hour: number;
                role: string;
                roleId: string;
                count: number;
              }[] = [];

              shifts.forEach((shift) => {
                const { startTime, endTime } = handleTimeToDateTime(
                  shift.startTime,
                  shift.endTime,
                  "hh:mm A"
                );

                const index = tooltip.findIndex(
                  (role) => role.roleId === shift.workerRoleId
                );

                if (index === -1) {
                  tooltip.push({
                    hour: localMoment(endTime, "MM/DD/YYYY HH:mm").diff(
                      localMoment(startTime, "MM/DD/YYYY HH:mm"),
                      "hours",
                      true
                    ),
                    role: shift.workerRoleName,
                    roleId: shift.workerRoleId,
                    count: 1,
                  });
                } else {
                  tooltip[index].count += 1;
                  tooltip[index].hour += localMoment(
                    endTime,
                    "MM/DD/YYYY HH:mm"
                  ).diff(
                    localMoment(startTime, "MM/DD/YYYY HH:mm"),
                    "hours",
                    true
                  );
                }
              });

              return (
                <RowContainer
                  tooltip={tooltip}
                  width={contentWidth}
                  weeklyNameClassName="w-[86px]"
                  key={dayOfWeek}
                  weeklyName={dayOfWeekToStringMaps[dayOfWeek]}
                  showAddShift={canAdd && enabled}
                  onAddShiftClick={() => {
                    onAddShiftClick?.({
                      dayOfWeek,
                    });
                  }}
                >
                  {getRowsByShifts(shiftData).map((row, i) => {
                    return (
                      <RowContainer width={contentWidth} key={i}>
                        {row.map((shift) => {
                          return (
                            <div key={shift.id}>
                              <ShiftItem
                                selectShiftIds={selectShiftIds}
                                onSelectShiftId={onSelectShiftId}
                                enabled={enabled && canEdit}
                                hourWidth={hourWidth}
                                shift={shift}
                                onDragStop={onDragStop}
                                onResizeStop={onResizeStop}
                                onClick={() => {
                                  onShiftItemClick && onShiftItemClick(shift);
                                }}
                              />
                            </div>
                          );
                        })}
                      </RowContainer>
                    );
                  })}
                </RowContainer>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default memo(ShiftTimeLine);
