import { EmployeesVo } from "@/app/admin/employees/type";

export type ListParams = {
  orderBy?: string;
  pageSize: number;
  pageNum: number;
};

export interface UserEmployessParams extends ListParams {
  companyId?: string;
  communityId?: string;
  departmentIds?: string[];
  keywords?: string;
  status?: string;
  roleId?: string;
  license?: string;
  orderByDepartmentIds?: string[];
}

export interface UserEmployessResponse {
  size: number;
  records: EmployeesVo[];
  current: number;
  total: number;
  pages: number;
}
export interface UserEmployessVo {
  userId: string;
  email: string;
  phone: string;
  isEnabled: boolean;
  firstName: string;
  lastName: string;
  middleName: string;
  portraitFileId: string;
  userCommunityId: string;
  shiftPreferenceTime: string;
  nationalPhone: string;
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

interface Department {
  deptId: string;
  name: string;
  description: string;
  isHppd: boolean;
  isEnabled: boolean;
  isReportPbjHour: boolean;
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
  employeeList: EmployeeList[];
}
interface EmployeeList {
  id: string;
  username: string;
}
interface DepartmentWorkRoleVo {
  departmentId: string;
  departmentName: string;
  hppdTargetHour: number;
  isHppd: boolean;
}

export interface AddEmployeeAdminReq {
  communityId: string;
  email?: string;
  phone?: string;
  nationalPhone?: string;
  firstName: string;
  lastName: string;
  workerRoleIds: string[];
  autoInvite: boolean;
}

export interface EditEmployeeAdminReq {
  communityId: string;
  email: string;
  phone: string;
  nationalPhone: string;
  firstName: string;
  lastName: string;
  workerRoleIds: string[];
  autoInvite: boolean;
  userId: string;
  workerId: string;
  middleName: string;
  externalId: string;
  license: string;
  hireDate: string;
  hourlyRate: number;
  targetedHoursPerWeek: number;
  terminationDate: string;
  departmentIds: string[];
  isOvertimeBlocked?: boolean;
  terDateBeforeEndDate?: boolean;
}

export interface GetRoleListApi {
  id: string;
  name: string;
}

export interface editInviteAdminReq {
  userCommunityRefId: string;
  workerRoleIds: string[];
  autoInvite: boolean;
  communityId: string;
  email: string;
  phone: string;
  nationalPhone: string;
  firstName: string;
  lastName: string;
}
