import { ListParams } from "@/api/types";

export type EmployeesVo = {
  name: string;
  workerRoleIds: (string | undefined)[] | undefined;
  firstName: string;
  id: string;
  lastName: string;
  middleName: string;
  externalId: string;
  email: string;
  phone: string;
  license: string;
  credential: string;
  hireDate: string;
  targetedHoursPerWeek: string;
  terminationDate: string;
  departmentIds: Array<string>;
  departments?: { deptId: string; name: string }[];
  status: number;
  userId: string;
  workerId: string;
  autoInvite?: boolean;
  roleIds?: string[];
  roles: { id: string }[];
  userCommunityRefId?: string;
  checkInTime?: string;
  checkOutTime?: string;
  exceptions: string;
  nationalPhone: string;
};
export type ShiftVo = {
  shiftDate: string;
  shiftTime: string;
  role: string;
  checkInTime: string;
  checkOutTime: string;
  exception: string;
};

export type GetTypeEmployeeParams =
  | ListParams
  | Partial<EmployeesVo>
  | {
      communityId: string;
      departmentId: string;
    };

export type GetTypeEmployeeResponse = {
  size: number;
  records: EmployeesVo[];
  current: number;
  total: number;
  pages: number;
};

export type AddTypeEmployeeParams = Partial<
  Omit<EmployeesVo, "id"> & {
    communityId: string;
  }
>;

export type EditTypeEmployeeParams = Partial<
  EmployeesVo & {
    communityId?: string;
    departmentId?: string;
  }
>;

export type SearchParams = Partial<{
  firstName: any;
  lastName: string;
  communityId: string;
  departmentIds?: string;
  keywords: string;
  roleId: string;
  license: string;
  status: string | Array<string>;
  startDate?: string[] | null;
  endDate?: [string | null, string | null] | null;
  exceptions: exceptionTypeEnum | null;
}>;

export type ErrorEntityType = {
  workRoleNames: string;
  email: string;
  phone: string;
  rowNum: number;
  rowTips: string;
};
export type exceptionTypeEnum =
  | "LATE_CHECK_IN"
  | "NO_SHOW"
  | "NOT_CHECK_IN"
  | "EARLY_CHECK_OUT"
  | "LATE_CHECK_OUT"
  | "LATE_CHECK_OUT_ONGOING"
  | "LEFT_WITHOUT_CHECKING_OUT"
  | "BREAK_TIME_EXCEPTION"
  | "SWAP_REQUEST"
  | "UP_FOR_GRABS"
  | "CALL_OFF";
export type ShiftListParams = {
  shiftStartDate: string | null;
  shiftEndDate: string | null;
  communityId: string;
  type: string;
  workerRoleId: string | null;
  userId: string;
  pageSize: number;
  pageNum: number;
  exceptionTypeEnum?: exceptionTypeEnum;
};

export type TimeOffListParams = {
  departmentIds: Array<string>;
  startFromDate: string | null;
  startToDate: string | null;
  endFromDate: string | null;
  endToDate: string | null;
  communityId: string;
  status: Array<string>;
  userId: string;
};

export type shiftListResponseVo = {
  breakRequiredMins: string | null;
  checkinTimeLocal: string | null;
  checkoutTimeLocal: string | null;
  checkinTime: string | null;
  checkoutTime: string | null;
  communityId: string | null;
  dayOfWeek: number;
  departmentId: string | null;
  durationMins: number;
  endTimeLocal: string | null;
  id: string | null;
  isPartialShift: boolean | null;
  isPublished: boolean;
  locationRefVOs: Array<any>;
  note: string | null;
  paidMins: string | null;
  parentId: string | null;
  scheduleId: string | null;
  shiftDate: string | null;
  shiftEndTime: string | null;
  shiftStartTime: string | null;
  startTimeLocal: string | null;
  startTimeUTC: string;
  endTimeUTC: string;
  checkinTimeUtc: string;
  checkoutTimeUtc: string;
  status: Array<string> | null;
  tags: string | null;
  userId: string | null;
  userName: string | null;
  workerRoleColor: string;
  workerRoleId: string | null;
  workerRoleName: string | null;
  exceptions?: exceptionTypeEnum;
};

export type shiftListResponse = {
  current: number;
  pages: number;
  records: Array<shiftListResponseVo>;
  size: number;
  total: number;
};

export type timeOffInfoResponseVo = {
  id: string | null;
  userCommunityRefId: string | null;
  communityId: string | null;
  communityName: string | null;
  reason: string | null;
  startTime: string | null;
  endTime: string | null;
  status: string | null;
  comment: string | null;
  reviewName: string | null;
  reviewTime: string | null;
  userId: string | null;
  userName: string | null;
  firstName: string | null;
  lastName: string | null;
  startDate: string | null;
  endDate: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
  startTimeUtc: string | null;
  endTimeUtc: string | null;
};

export type timeOffListResponseVo = {
  comment: string | null;
  communityId: string | null;
  communityName: string | null;
  departments: string | null;
  endDate: string | null;
  endDateTime: string | null;
  endTime: string | null;
  firstName: string | null;
  id: string | null;
  lastName: string | null;
  reason: string | null;
  reviewName: string | null;
  reviewTime: string | null;
  startDate: string | null;
  startDateTime: string | null;
  startTime: string | null;
  status: string | null;
  userCommunityRefId: string | null;
  userId: string | null;
  userName: string | null;
  workerRoles: string | null;
  startTimeUtc: string | null;
  endTimeUtc: string | null;
};

export type timeOffListResponse = {
  current: number;
  pages: number;
  records: Array<timeOffListResponseVo>;
  size: number;
  total: number;
};

export type TimeOffStatus = "APPROVED" | "REJECTED" | "PENDING";

export type NeedHelpShiftCount = {
  swapsCount: number;
  ufgCount: number;
  callOffCount: number;
  openShiftClaimsCount: number;
  overtimeShiftsCount: number;
};

export type AddEmployeeByAdminParams = {
  communityId: string;
  email: string;
  workerRoleIds: string[];
  autoInvite: boolean;
};
