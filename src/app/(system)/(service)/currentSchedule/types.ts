import { ScheduleShiftCreateParams } from "@/api/currentSchedule/types";

interface LocationRefVO {
  id: string;
  locationName: string;
  locationId: string;
}

interface Shift {
  id: string;
  scheduleId: string;
  communityId: string;
  departmentId: string;
  departmentName: string;
  locationRefVOs: LocationRefVO[];
  workerRoleId: string;
  workerRoleName: string;
  workerRoleColor: string;
  userId: string;
  userName: string;
  dayOfWeek: number;
  startTimeLocal: string;
  endTimeLocal: string;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftDate: string;
  durationMins: number;
  paidMins?: any;
  status?: any;
  note?: any;
  breakRequiredMins?: any;
  checkinTime?: any;
  checkoutTime?: any;
  parentId?: any;
  isPartialShift?: any;
  isPublished: boolean;
}

interface Statistic {
  shiftDate: string;
  targetHPPD: number;
  plannedHPPD: number;
  assignedHPPD: number;
  shifts: Shift[];
}

interface Role {
  roleId: string;
  roleName: string;
  roleColor: string;
  statistics: Statistic[];
}

export type ScheduleShiftVOs = {
  departmentId: string;
  departmentName: string;
  roles: Role[];
  viewState?: string;
};

export interface RoleViewWeeklyType {
  startOfWeek: string;
  scheduleShiftVOs: ScheduleShiftVOs[];
}

export interface ScheduleShiftCreateForm extends ScheduleShiftCreateParams {
  checkInTime: string;
  checkOutTime: string;
  checkInDate: string;
  checkOutDate: string;
  breakTime: {
    breakTime: string;
    breakType: string;
  }[];
}

export interface ShiftInfo {
  departmentName: string;
  locationList: string[];
  workerRoleName: string;
  userName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftDate: string;
  note: string;
}

export interface TimeAndAttendanceFromVo {
  breakType: string;
  durationMins: number | string;
}

export interface TimeAndAttendanceVo extends TimeAndAttendanceFromVo {
  id: string;
}
export type LocationInfo = {
  checkin: { lng: number | null; lat: number | null };
  checkout: { lng: number | null; lat: number | null };
};
