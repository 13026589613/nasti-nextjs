import { DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { memo, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  TemplateShift,
  TemplateShiftEmployee,
} from "@/api/scheduleTemplates/types";
import { onAddShiftClickFn } from "@/app/(system)/(service)/scheduleTemplates/edit/components/ScheduleTemplateViews";
import CollapsiblePanel from "@/components/schedules/components/weekly/CollapsiblePanel";
import ColumnContainer from "@/components/schedules/components/weekly/ColumnContainer";
import DndContainer from "@/components/schedules/components/weekly/DndContainer";
import Header, {
  DayData,
} from "@/components/schedules/components/weekly/RoleHeader";
import useGlobalTime from "@/hooks/useGlobalTime";
import useAppStore from "@/store/useAppStore";
import useAuthStore from "@/store/useAuthStore";

import { WeeklyDaysType } from "../../../types/weekly";
import { handleTimeToDateTime } from "../../../utils";
import ShiftItem from "../../components/ShiftItem";
export interface WeeklyProps {
  selectShiftIds?: string[];
  onSelectShiftId?: (shift: TemplateShift) => void;
  enabled: boolean;
  data: TemplateShiftEmployee[];
  weeklyDays: WeeklyDaysType[];
  onDragStart?(event: DragStartEvent): void;
  onDragEnd?(event: DragEndEvent): void;
  onShiftItemClick?(shift: TemplateShift): void;
  onAddShiftClick: onAddShiftClickFn;
}

const ScheduleWeekly = (props: WeeklyProps) => {
  const {
    selectShiftIds,
    onSelectShiftId,
    enabled,
    data,
    weeklyDays,
    onDragStart,
    onDragEnd,
    onShiftItemClick,
    onAddShiftClick,
  } = props;

  const { localMoment } = useGlobalTime();

  const { navbarWidth } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const canAdd = useMemo(() => {
    return permission.includes("TEMPLATE_MANAGEMENT_ADD");
  }, [permission]);

  const canEdit = useMemo(() => {
    return permission.includes("TEMPLATE_MANAGEMENT_EDIT");
  }, [permission]);

  const [activeShiftInfo, setActiveShiftInfo] = useState<TemplateShift | null>(
    null
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    const activeCurrent = active.data.current?.shift as TemplateShift;

    if (!activeCurrent) return;

    setActiveShiftInfo(activeCurrent);

    onDragStart && onDragStart(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveShiftInfo(null);
    onDragEnd && onDragEnd(event);
  };

  const [hoverShowAddKey, setHoverShowAddKey] = useState("");

  const dayData: DayData[] = useMemo(() => {
    const res: DayData[] = [];
    weeklyDays.forEach(({ dayOfWeek, dayOfWeekName, date }) => {
      res.push({
        dayOfWeek,
        dayOfWeekName,
        date,
        role: data.reduce((acc, user) => {
          user.shifts
            .filter((shift) => {
              return shift.dayOfWeek === dayOfWeek;
            })
            .forEach((shift) => {
              const index = acc.findIndex(
                (role) => role.workerRoleId === shift.workerRoleId
              );
              if (index === -1) {
                acc.push({
                  workerRoleId: shift.workerRoleId,
                  workerRoleName: shift.workerRoleName,
                  count: 1,
                  hours: localMoment(
                    handleTimeToDateTime(
                      shift.startTime,
                      shift.endTime,
                      "hh:mm A"
                    ).endTime,
                    "MM/DD/YYYY HH:mm"
                  ).diff(
                    localMoment(
                      handleTimeToDateTime(
                        shift.startTime,
                        shift.endTime,
                        "hh:mm A"
                      ).startTime,
                      "MM/DD/YYYY HH:mm"
                    ),
                    "hours",
                    true
                  ),
                });
              } else {
                acc[index].count += 1;
                acc[index].hours += localMoment(
                  handleTimeToDateTime(
                    shift.startTime,
                    shift.endTime,
                    "hh:mm A"
                  ).endTime,
                  "MM/DD/YYYY HH:mm"
                ).diff(
                  localMoment(
                    handleTimeToDateTime(
                      shift.startTime,
                      shift.endTime,
                      "hh:mm A"
                    ).startTime,
                    "MM/DD/YYYY HH:mm"
                  ),
                  "hours",
                  true
                );
              }
            });
          return acc;
        }, [] as { workerRoleId: string; workerRoleName: string; count: number; hours: number }[]),
      });
    });
    return res;
  }, [data]);

  return (
    <div className="relative mt-[20px]">
      <div className="border-l-[1px] border-l-[#E7EDF1] mb-[18px]">
        <Header weeklyDays={dayData} />

        {data?.map((user) => (
          <CollapsiblePanel
            key={user.userId}
            title={user.userName}
            roleColor="#F4F4F5"
            defaultOpen
            weeklyDays={weeklyDays}
            showAddBtn={canAdd}
            onAddShiftClick={({ dayOfWeek }) => {
              onAddShiftClick({
                dayOfWeek,
                userId: user.userId,
              });
            }}
            isHoverCard={user.userName !== "Not Assigned"}
            hoverCardId={user.userId}
            showAddKey={`${user.userId}`}
            hoverShowAddKey={hoverShowAddKey}
          >
            <DndContainer
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex pl-[100px] border-r-[1px]  border-r-[#E7EDF1]">
                {!!navbarWidth &&
                  weeklyDays.map(({ dayOfWeek }) => (
                    <div
                      className="border-l-[#E7EDF1] border-l-[1px]"
                      key={dayOfWeek}
                      style={{
                        width: (navbarWidth - 135) / 7,
                        minWidth: "calc((100% - 135px) / 7)",
                      }}
                      onMouseEnter={() => {
                        setHoverShowAddKey(`${user.userId}-${dayOfWeek}`);
                      }}
                      onMouseLeave={() => {
                        setHoverShowAddKey("");
                      }}
                    >
                      <ColumnContainer
                        id={`${dayOfWeek}`}
                        other={{
                          userId: user.userId,
                        }}
                      >
                        <div className="m-[15px_0_15px]">
                          {user?.shifts
                            .filter((shift) => {
                              return shift.dayOfWeek === dayOfWeek;
                            })
                            .sort((a, b) => {
                              const aTime = handleTimeToDateTime(
                                a.startTime,
                                a.endTime,
                                "hh:mm A"
                              );
                              const bTime = handleTimeToDateTime(
                                b.startTime,
                                b.endTime,
                                "hh:mm A"
                              );

                              // Sort by userName, startTime, endTime, id

                              if (
                                localMoment(
                                  aTime.startTime,
                                  "MM/DD/YYYY HH:mm"
                                ).isBefore(
                                  localMoment(
                                    bTime.startTime,
                                    "MM/DD/YYYY HH:mm"
                                  )
                                )
                              )
                                return -1;
                              if (
                                localMoment(
                                  aTime.startTime,
                                  "MM/DD/YYYY HH:mm"
                                ).isAfter(
                                  localMoment(
                                    bTime.startTime,
                                    "MM/DD/YYYY HH:mm"
                                  )
                                )
                              )
                                return 1;

                              if (
                                localMoment(
                                  aTime.endTime,
                                  "MM/DD/YYYY HH:mm"
                                ).isBefore(
                                  localMoment(bTime.endTime, "MM/DD/YYYY HH:mm")
                                )
                              )
                                return -1;
                              if (
                                localMoment(
                                  aTime.endTime,
                                  "MM/DD/YYYY HH:mm"
                                ).isAfter(
                                  localMoment(bTime.endTime, "MM/DD/YYYY HH:mm")
                                )
                              )
                                return 1;

                              if (a.workerRoleName && b.workerRoleName) {
                                return a.workerRoleName.localeCompare(
                                  b.workerRoleName
                                );
                              } else if (
                                a.workerRoleName &&
                                !b.workerRoleName
                              ) {
                                return 1;
                              } else if (
                                !a.workerRoleName &&
                                b.workerRoleName
                              ) {
                                return -1;
                              } else if (
                                !a.workerRoleName &&
                                !b.workerRoleName
                              ) {
                                return a.id.localeCompare(b.id);
                              }

                              if (a.id < b.id) return -1;
                              if (a.id > b.id) return 1;

                              return 0;
                            })
                            .map((shift) => {
                              return (
                                <ShiftItem
                                  selectShiftIds={selectShiftIds}
                                  onSelectShiftId={onSelectShiftId}
                                  viewType="employee"
                                  disabled={!enabled || !canEdit}
                                  key={shift.id}
                                  shift={{
                                    ...shift,
                                    userId: user.userId,
                                  }}
                                  isEmployeeView
                                  onClick={() => {
                                    if (enabled && canEdit) {
                                      onShiftItemClick &&
                                        onShiftItemClick(shift);
                                    }
                                  }}
                                />
                              );
                            })}
                        </div>
                      </ColumnContainer>
                    </div>
                  ))}
              </div>

              <DragOverlay adjustScale={false}>
                {/* Drag Overlay For item Item */}
                {activeShiftInfo?.id && (
                  <ShiftItem
                    viewType="employee"
                    shift={activeShiftInfo}
                    isEmployeeView
                    disabled={!enabled || !canEdit}
                  />
                )}
              </DragOverlay>
            </DndContainer>
          </CollapsiblePanel>
        ))}
      </div>
    </div>
  );
};

export default memo(ScheduleWeekly);
