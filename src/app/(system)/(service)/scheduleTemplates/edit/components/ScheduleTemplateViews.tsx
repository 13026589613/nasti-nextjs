"use client";

import { DragEndEvent } from "@dnd-kit/core";
import { memo, useMemo } from "react";

import {
  ShiftTime,
  TemplateShift,
  TemplateShiftEmployee,
  TemplateShiftRole,
  TemplateShiftType,
} from "@/api/scheduleTemplates/types";
import EmployeeWeekly from "@/components/schedules/templateSchedule/package/employeeWeekly";
import RoleWeekly from "@/components/schedules/templateSchedule/package/roleWeekly";
import ShiftTimeLine from "@/components/schedules/templateSchedule/package/shiftTimeLine";
import { onDragStopCallback } from "@/components/schedules/templateSchedule/package/shiftTimeLine/types";
import { WeeklyDaysType } from "@/components/schedules/types/weekly";
import { sortStartWeek } from "@/components/schedules/utils";

import { ViewData } from "./types";

export type onAddShiftClickFn = ({
  dayOfWeek,
  workerRoleId,
  userId,
}: {
  dayOfWeek: number;
  workerRoleId?: string;
  userId?: string;
}) => void;

type ScheduleTemplateViewsProps = {
  selectShiftIds?: string[];
  onSelectShiftId?: (shift: TemplateShift) => void;
  enabled?: boolean;
  shiftTimeViewData: ViewData<ShiftTime>;
  roleViewData: ViewData<TemplateShiftRole>;
  employeeViewData: ViewData<TemplateShiftEmployee>;
  currentView: TemplateShiftType;
  templateId: string;
  onShiftItemClick?(shift: TemplateShift): void;
  onRoleViewDragEnd?(event: DragEndEvent): void;
  onEmployeeViewDragEnd?(event: DragEndEvent): void;
  onShiftTimeDragStop: onDragStopCallback;
  onShiftTimeResizeStop: onDragStopCallback;
  onAddShiftClick: onAddShiftClickFn;
};

const weeklyDays = [
  {
    dayOfWeekName: "Mon",
    dayOfWeekFullName: "MONDAY",
    dayOfWeek: 1,
  },
  {
    dayOfWeekName: "Tue",
    dayOfWeekFullName: "TUESDAY",
    dayOfWeek: 2,
  },
  {
    dayOfWeekName: "Wed",
    dayOfWeekFullName: "WEDNESDAY",
    dayOfWeek: 3,
  },
  {
    dayOfWeekName: "Thu",
    dayOfWeekFullName: "THURSDAY",
    dayOfWeek: 4,
  },
  {
    dayOfWeekName: "Fri",
    dayOfWeekFullName: "FRIDAY",
    dayOfWeek: 5,
  },
  {
    dayOfWeekName: "Sat",
    dayOfWeekFullName: "SATURDAY",
    dayOfWeek: 6,
  },
  {
    dayOfWeekName: "Sun",
    dayOfWeekFullName: "SUNDAY",
    dayOfWeek: 7,
  },
];

const dayHours = [
  "12AM",
  "1AM",
  "2AM",
  "3AM",
  "4AM",
  "5AM",
  "6AM",
  "7AM",
  "8AM",
  "9AM",
  "10AM",
  "11AM",
  "12PM",
  "1PM",
  "2PM",
  "3PM",
  "4PM",
  "5PM",
  "6PM",
  "7PM",
  "8PM",
  "9PM",
  "10PM",
  "11PM",
];

const ScheduleTemplateViews = (props: ScheduleTemplateViewsProps) => {
  const {
    selectShiftIds,
    onSelectShiftId,
    enabled = true,
    shiftTimeViewData,
    roleViewData,
    employeeViewData,
    currentView,
    onShiftItemClick,
    onRoleViewDragEnd,
    onEmployeeViewDragEnd,
    onShiftTimeDragStop,
    onShiftTimeResizeStop,
    onAddShiftClick,
  } = props;

  const getScheduleTemplateView = useMemo(() => {
    switch (currentView) {
      case "shiftTime":
        return (
          <ShiftTimeLine
            selectShiftIds={selectShiftIds}
            onSelectShiftId={onSelectShiftId}
            enabled={enabled}
            dayHours={dayHours}
            startOfWeek={shiftTimeViewData.startOfWeek}
            data={shiftTimeViewData?.scheduleTemplateShiftVOs}
            onDragStop={onShiftTimeDragStop}
            onResizeStop={onShiftTimeResizeStop}
            onShiftItemClick={onShiftItemClick}
            onAddShiftClick={onAddShiftClick}
          />
        );
      case "role":
        return (
          <RoleWeekly
            selectShiftIds={selectShiftIds}
            onSelectShiftId={onSelectShiftId}
            enabled={enabled}
            onShiftItemClick={onShiftItemClick}
            data={roleViewData?.scheduleTemplateShiftVOs}
            weeklyDays={
              sortStartWeek(
                roleViewData.startOfWeek,
                weeklyDays
              ) as WeeklyDaysType[]
            }
            onDragEnd={onRoleViewDragEnd}
            onAddShiftClick={onAddShiftClick}
          />
        );
      case "employee":
        return (
          <EmployeeWeekly
            selectShiftIds={selectShiftIds}
            onSelectShiftId={onSelectShiftId}
            enabled={enabled}
            data={employeeViewData?.scheduleTemplateShiftVOs}
            weeklyDays={
              sortStartWeek(
                employeeViewData.startOfWeek,
                weeklyDays
              ) as WeeklyDaysType[]
            }
            onShiftItemClick={onShiftItemClick}
            onDragEnd={onEmployeeViewDragEnd}
            onAddShiftClick={onAddShiftClick}
          />
        );
    }
  }, [
    currentView,
    shiftTimeViewData,
    roleViewData,
    employeeViewData,
    selectShiftIds,
  ]);

  return <div>{getScheduleTemplateView}</div>;
};

export default memo(ScheduleTemplateViews);
