export interface Department {
  id: string;
  departmentName: string;
  hppdTargetHour?: any;
}

interface LocationRefVO {
  id: string;
  locationName: string;
  locationId: string;
}

export type GetScheduleTemplateListParams = {
  name: string;
  companyId: string;
  communityId: string;
  departmentId: string;
};

export interface GetScheduleTemplateListRecord {
  id: string;
  name: string;
  lastUserDate: string;
  departmentName: string;
  departmentId: string;
  createdBy: string;
  author: string;
  existShift?: boolean;
}

export interface ScheduleTemplateCreateParams {
  communityId: string;
  departmentId: string;
  name: string;
}

export interface GetScheduleTemplateInfoRes {
  id: string;
  name: string;
  lastUserDate?: any;
  departmentId: string;
  departmentName: string;
  createdBy: string;
  author?: any;
}

export interface ScheduleTemplateEditParams {
  id: string;
  communityId: string;
  name: string;
}

export type TemplateShiftType = "shiftTime" | "role" | "employee";

export interface GetScheduleTemplateShiftListParams {
  templateId: string;
  type: TemplateShiftType;
  communityId: string;
  notAssigned?: boolean;
  departmentId?: string;
  locationId?: string;
  workerRoleId?: string;
  userId?: string | null;
}

export interface TemplateShift {
  id: string;
  shiftId: string;
  templateId: string;
  communityId: string;
  departmentId: string;
  departmentName: string;
  locationRefVOs?: LocationRefVO[];
  workerRoleId: string;
  workerRoleName?: any;
  workerRoleColor?: any;
  userId?: any;
  userName?: any;
  startTime: string;
  endTime: string;
  planStartTime?: string;
  planEndTime?: string;
  dayOfWeek: number;
  durationMins: number;
  timeOut: boolean;
  isRepeat: boolean;
  isMoreThan16Hours: boolean;
  isShowTargetHoursTag: boolean;
  isShowOvertimeTag: boolean;
  isPassOvertimeRules: boolean;
  isMultiDay: boolean;
}

export interface TemplateShiftRole {
  roleId: string;
  roleName?: any;
  roleColor?: any;
  shifts: TemplateShift[];
}

export interface HandleRoleShiftData {
  roleId: string;
  roleName: string;
  roleColor: string;
  shifts: {
    dayOfWeek: string;
    shifts: TemplateShift[];
  }[];
}

export interface TemplateShiftEmployeeDepartment {
  departmentId: string;
  departmentName: string;
  shifts: TemplateShift[];
}

export interface TemplateShiftEmployee {
  departmentId?: any;
  departmentName?: any;
  userId: string;
  userName: string;
  roles?: any;
  departments: TemplateShiftEmployeeDepartment[];
  shifts: TemplateShift[];
  startOfWeek: string;
}

export interface ShiftTime {
  dayOfWeek: number;
  shifts: TemplateShift[];
}

export type GetScheduleTemplateShiftListRes<T extends TemplateShiftType> =
  T extends "role"
    ? {
        startOfWeek: string;
        scheduleTemplateShiftVOs: TemplateShiftRole[];
      }
    : T extends "employee"
    ? {
        startOfWeek: string;
        scheduleTemplateShiftVOs: TemplateShiftEmployee[];
      }
    : {
        startOfWeek: string;
        scheduleTemplateShiftVOs: ShiftTime[];
      };

export interface ScheduleTemplateShiftCreateParams {
  id?: string;
  templateId?: string;
  communityId?: string;

  departmentId: string;
  locationIds?: string[];
  workerRoleId: string;
  userId?: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number[];
  quantity?: string;
}

export interface ScheduleTemplateShiftInfoRes {
  id: string;
  templateId: string;
  communityId: string;
  departmentId: string;
  departmentName: string;
  locationRefVOs: LocationRefVO[];
  workerRoleId: string;
  workerRoleName: string;
  workerRoleColor: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  durationMins: number;
  timeOut: boolean;
  isRepeat: boolean;
  isMoreThan16Hours: boolean;
  isShowTargetHoursTag: boolean;
  isShowOvertimeTag: boolean;
  isPassOvertimeRules: boolean;
}

export interface GetScheduleTemplateShiftRoleListParams {
  templateId: string;
  communityId: string;
  departmentId: string;
}
