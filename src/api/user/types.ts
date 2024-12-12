export interface GetUserWorkerListParams {
  communityId: string;
  departmentId?: string;
  orderByDepartmentIds?: string;
  keywords?: string;
  status?: number;
  roleId?: string;
  license?: string;
}

export interface GetUserWorkerListRoleAllParams {
  communityId: string;
  departmentIds: string;
}

interface DepartmentWorkRoleVo {
  id: string;
  departmentName: string;
  hppdTargetHour: number;
}

interface Role {
  id: string;
  communityId: string;
  pbjJobId: string;
  code: string;
  name: string;
  color: string;
  isEnabled: boolean;
  departmentWorkRoleVos: DepartmentWorkRoleVo[];
}

interface Department {
  deptId: string;
  name: string;
  description: string;
  isHppd: boolean;
  isEnabled: boolean;
  isReportPbjHour: boolean;
}

export interface GetUserWorkerListRecord {
  userId: string;
  email: string;
  phone: string;
  isEnabled: boolean;
  firstName: string;
  lastName: string;
  middleName: string;
  portraitFileId: string;
  workerId: string;
  userCommunityRefId: string;
  externalId: string;
  title: string;
  license: string;
  hireDate: string;
  hourlyRate: number;
  targetedHoursPerWeek: number;
  terminationDate: string;
  status: number;
  roles: Role[];
  departments: Department[];
}

interface GetUserWorkerListRecordDepartment {
  id: string;
  communityId: string;
  name: string;
  description: string;
  isHppd: boolean;
  isEnabled: boolean;
  isReportPbjHour: boolean;
  isTrackCensus: boolean;
  userCommunityRefId: string;
  locationList?: any;
  adminList?: any;
  employeeList?: any;
}

//todo
export interface GetUserWorkerListRoleAllReq {
  userId: string;
  email?: string;
  phone?: string;
  isEnabled?: boolean;
  firstName: string;
  lastName: string;
  middleName: string;
  portraitFileId?: string;
  userCommunityId?: string;
  shiftPreferenceTime: string;
  departments: GetUserWorkerListRecordDepartment[];
  userPreference?: {
    locationNames?: string | null;
    shiftPreferenceTime?: string | null;
  };
  timeOff?: boolean;
  overTime?: boolean;
  moreThan40HoursTag?: boolean;
  moreThanTargetHoursTag?: boolean;
  repeat?: boolean;
  moreThan16Hours?: boolean;
  checkOverTimeDates: string[];
  checkMoreThan40HoursTagDates: string[];
  checkMoreThanTargetHoursTagDates: string[];
  checkRepeatDates: string[];
  checkMoreThan16HoursDates: string[];
}

export interface GetUserWorkerInfoRes {
  userId: string;
  email: string;
  phone: string;
  isEnabled: boolean;
  firstName: string;
  lastName: string;
  middleName?: any;
  portraitFileId?: any;
  workerId?: any;
  userCommunityRefId?: any;
  externalId?: any;
  title?: any;
  license?: any;
  hireDate?: any;
  hourlyRate?: any;
  targetedHoursPerWeek?: any;
  terminationDate?: any;
  status: number;
  roles: Role[];
  departments: any[];
}

export interface GetUserCommunityListResponse {
  id: string;
  companyId: string;
  name: string;
  isConfirmed: boolean;
  isEnabled: boolean;
  startOfWeek: string;
  timeZoneId: string;
  zoneId: string;
  zoneShortName: string;
  attendanceEnabled: boolean;
  userCommunityRefId: string;
}

export interface GetUserDepartmentListResponse {
  id: string;
  name: string;
}

export interface GetUserCompanyListResponse {
  id: string;
  name: string;
}

export interface GetUserCompanyTreeResponse {
  id: string;
  name: string;
  communityList: GetUserCommunityListResponse[];
}

export interface UserChangePasswordReq {
  oldPassword: string;
  newPassword: string;
}

export interface GetSuperAdminCommunityListResponse {
  userCommunityRefId: string;
  id: string;
  companyId: string;
  name: string;
  isConfirmed: boolean;
  isEnabled: boolean;
  startOfWeek: string;
  attendanceEnabled: boolean;
  timeZoneId: string;
  zoneId: string;
  zoneShortName: string;
}
export interface UserEditUserInfoReq {
  userId: string;
  communityId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  portraitFileId: string | null;
  nationalPhone: string;
}
