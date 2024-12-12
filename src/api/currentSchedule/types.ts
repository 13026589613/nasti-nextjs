import { EXCEPTION_REASON } from "@/constant/statusConstants";

export type ScheduleShiftCreateParams = {
  id?: string;
  published?: boolean;
  communityId: string;
  scheduleId?: string | null;
  departmentId: string;
  departmentName: string;
  locationIds?: string[];
  locationNames?: string[];
  workerRoleId: string;
  workerRoleName?: string;
  userId: string;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftDate: string[];
  note: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  quantity: string;
  confirmPublish?: boolean;
};

export type ScheduleShiftBatchEditParams = {
  ids: string[];
  scheduleId: string;
  communityId: string;
  locationIds?: string[];
  workerRoleId?: string;
  userId?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  shiftDate?: string;
  note?: string;
  confirmPublish?: boolean;
};

export type Chooses = "Hours" | "HPPD";

export type ScheduleShiftListEmployeeParams = {
  onlyOverTime?: boolean;
  onlyUnPublished?: boolean;
  scheduleId?: string | null;
  communityId: string;
  departmentId?: string;
  locationIds?: string[] | null;
  workerRoleIds?: string[] | null;
  userIds?: string[] | null;
  notAssigned?: boolean;
  type: string;
  shiftStartDate: string;
  shiftEndDate: string | null;
  chooses?: Chooses;
};

interface LocationRefVO {
  id: string;
  locationName: string;
  locationId: string;
}

export interface ScheduleShift {
  id: string;
  scheduleId: string;
  communityId: string;
  departmentId: string;
  locationRefVOs?: LocationRefVO[];
  workerRoleId: string;
  workerRoleName: string;
  workerRoleColor: string;
  departmentName: string;
  userId: string;
  userName: string;
  dayOfWeek: number;
  startTimeLocal: string;
  startTimeUTC: string;
  endTimeLocal: string;
  endTimeUTC: string;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftDate: string;
  durationMins: number;
  paidMins?: any;
  status?: any;
  note: string;
  breakRequiredMins?: any;
  checkinTime?: any;
  checkoutTime?: any;
  parentId?: any;
  isPartialShift?: any;
  isPublished: boolean;
  tags: number[] | null;
  checkinTimeLocal: string;
  checkoutTimeLocal: string;
  checkinLat: number;
  checkinLng: number;
  checkoutLat: number;
  checkoutLng: number;
  attendeeStatus: AttendeeStatus;
  timeEndTime: string;
  timeEndTimeLocal: string;
  timeId: string;
  timeShiftDate: string;
  timeStartTime: string;
  timeStartTimeLocal: string;
  //Properties added during run
  showDate?: string;
  //Properties added during drag
  dragData?: boolean;
  //Properties Whether to hide the second half of the day when the shift crosses the day
  isShowEmpty?: boolean;
  //Properties Whether to display the shift as a cross-day shift
  isCrossDayStart?: boolean;
}

export interface ActiveScheduleShift extends ScheduleShift {
  showLeft?: boolean;
  showRight?: boolean;
}

export type AttendeeStatus = keyof typeof EXCEPTION_REASON;

export interface ScheduleUser {
  userId: string;
  userName: string;
  statistics: Statistic[];
}

export type ScheduleDepartment = {
  departmentId: string;
  departmentName: string;
  users: ScheduleUser[];
};

export type ShiftEmployeeViewData<T> = {
  startOfWeek: string;
  shiftEmployeeViewVOS?: T[];
};

export type ShiftRoleViewData<T> = {
  startOfWeek: string;
  shiftRoleViewVOS?: T[];
};

export interface Statistic {
  shiftDate: string;
  targetHPPD?: number;
  plannedHPPD?: any;
  actualHPPD?: number;
  assignedHours?: number;
  assignedHPPD?: any;
  hours?: number;
  actualHours?: number;
  shifts: ScheduleShift[];
}

export interface ScheduleRole {
  roleId: string;
  roleName: string;
  roleColor: string;
  targetHPPD?: any;
  plannedHPPD?: any;
  assignedHPPD?: any;
  hours?: any;
  actualHours?: number;
  assignedHours?: number;
  statistics: Statistic[];
}

interface RoleVO {
  roleId: string;
  roleName: string;
  roleColor: string;
  targetHPPD?: any;
  plannedHPPD?: any;
  assignedHPPD?: any;
  hours: number;
  statistics?: any;
}

interface Time {
  time: string;
  roleVOS: RoleVO[];
}

export type RoleDepartment = {
  departmentId: string;
  departmentName: string;
  isHppd: boolean;
  isCensus: boolean;
  roles: ScheduleRole[];
  times?: Time[];
};

export type MonthlyRoleVO = {
  time: string;
  roleVOS: [
    {
      roleId: string;
      roleName: string;
      roleColor: string;
      targetHPPD?: number;
      plannedHPPD?: number;
      assignedHPPD?: number;
      assignedHours: number;
      hours: number;
      statistics?: any;
    }
  ];
};

export type ScheduleShiftDepartmentListParams = {
  communityId: string;
  departmentIds?: string[];
  shiftStartDate?: string;
  shiftEndDate?: string | null;
  type?: string;
};

export interface DepartmentShiftVO {
  departmentId: string;
  departmentName: string;
  scheduleId?: string;
  isTemplateExist?: any;
  isHppd: boolean;
  isCensus: boolean;
  isPublished?: boolean;
  shiftUnPublished: boolean;
}

export type ScheduleShiftDepartmentListRes = {
  startOfWeek: string;
  departmentShiftVOS: DepartmentShiftVO[];
};

export type DepartmentCensusListParams = {
  communityId: string;
  departmentId: string;
  census?: number;
  startShiftDate: string;
  endShiftDate: string | null;
};

export type DepartmentCensusEditParams = {
  id?: string;
  communityId: string;
  departmentId: string;
  census: number;
  shiftDate?: string;
};

export type DepartmentCensusListRes = {
  id: string;
  communityId: string;
  departmentId: string;
  census: number;
  shiftDate: string;
};

export type DepartmentScheduleRolesParams = {
  departmentId: string;
  scheduleId: string;
  communityId: string;
};

export type DepartmentScheduleRolesRes = {
  workerRoleId: string;
  name: string;
  color: string;
}[];

export type ShiftTargetHppdAdjustParams = {
  communityId: string;
  departmentId: string;
  scheduleId: string;
  hppd: number;
  workerRoleId: string;
  shiftDate: string;
};

export type ApplyTemplateParams = {
  communityId: string;
  departmentId: string;
  shiftStartDate: string;
  shiftEndDate: string;
  templateId: string;
  scheduleId?: string | null;
  type: 0 | 1; //0:delete, 1:remain
};

export type scheduleShiftTemplatePreCheckParams = {
  communityId: string;
  departmentId: string;
  shiftStartDate: string;
  shiftEndDate: string;
};

export type ScheduleTemplateListOptionParams = {
  companyId?: string;
  communityId: string;
  departmentId: string;
  name?: string;
};

export type ScheduleTemplateListOptionRes = {
  author?: string | null;
  createdBy: string;
  departmentId: string;
  departmentName?: string | null;
  id: string;
  lastUserDate?: string | null;
  name: string;
};

export type PublishScheduleRes = {
  isSuccess: boolean;
  validateMsg: string[];
  validateKey: string;
  type: string;
  repetitionKey: string;
};

export type PublishShiftRes = {
  isSuccess: boolean;
  validateMsg: string[];
};

export type UnpublishShift = {
  scheduleId: string;
  shiftIds: string[];
};

export type GetScheduleInfoParams = {
  communityId: string;
  departmentId: string;
  date: string;
};

export type GetScheduleInfoRes = {
  id: string;
  communityId: string;
  departmentId: string;
  weekOfYear: number;
  startDate: string;
  endDate: string;
  templateId: string;
  isPublished: boolean;
  year: number;
  createdAt: string;
  isCreate: boolean;
  templateName: string;
};

export type AddShiftDialogScheduleInfo = {
  departmentId: string;
  weekStartDate: string;
  weekEndDate: string;
  isPublished: boolean;
};

export type GetShiftHistoryListRes = {
  id: string;
  shiftId: string;
  description: string;
  createdAt: string;
  comment: string;
};

export type ScheduleShiftReviewParams = {
  shiftId: string;
  comment: string | null;
  status: string;
};

type breakListItem = {
  id?: string;
  durationMins: string;
  breakType: string;
  communityId: string;
  shiftId: string;
};

export type saveShiftBreakParams = {
  actionType: number;
  shiftId: string;
  communityId: string;
  breakList: breakListItem[];
  comment?: string;
};
