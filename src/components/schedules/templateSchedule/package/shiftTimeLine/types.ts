import { TemplateShift } from "@/api/scheduleTemplates/types";

import { ShiftType } from "../../types";

export interface WeeklyShift extends ShiftType {
  weeklyName: string;
}

interface WeeklyType {
  weeklyName: string;
  shifts: WeeklyShift[];
}

export interface WeeklyTimeLineDataType {
  departmentId: string;
  departmentName: string;
  weekly: WeeklyType[];
}

export type onDragStopCallback = (
  processData: {
    newStartTime: string;
    newEndTime: string;
  },
  shift: TemplateShift
) => void;

export type onResizeStopCallback = (
  processData: {
    newStartTime: string;
    newEndTime: string;
  },
  shift: TemplateShift
) => void;
