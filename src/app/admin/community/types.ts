/**
 * @description UserCommunityRef Type
 */
import { ListParams, ListResponse } from "@/api/types";
import { ADMIN_USER_STATUS } from "@/constant/statusConstants";

export type DepartmentListVos = {
  id: string;
  name: string;
};

export type CommunityInner = {
  id: string;
  communityName: string;
};

/**
 * @description View Type
 */
export type CommunityVo = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  terminationDate: string;
  status: keyof typeof ADMIN_USER_STATUS;
  statusName: string;
  community: CommunityInner[];
  departmentListVos: DepartmentListVos[];
  displayNames: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isDeleted: boolean;
  communityId: string;
};

/**
 * @description Operate Type
 */
export type AdminUserRef = Omit<
  CommunityVo,
  "createAt" | "createBy" | "updateAt" | "updateBy" | "deleted"
>;

/**
 * @description List Params
 */
export type GetUserAdminUserParams = ListParams & {
  departmentId?: string;
  companyId?: string;
  communityId?: string;
  roleId?: string;
  status?: keyof typeof ADMIN_USER_STATUS;
  name?: string;
  email?: string;
  condition?: string;
  departmentName?: string;
  title?: string;
};

/**
 * @description List Data
 */
export type GetUserAdminUserResponse = ListResponse<CommunityVo>;

/**
 * @description Search
 */
export type CommunitySearchParams = {
  departmentId?: string;
  roleId?: string;
  // status?: keyof typeof ADMIN_USER_STATUS;
  name?: string;
  email?: string;
  title?: string;
  condition?: string;
  companyId?: string;
  communityId?: string;
  // state?: string;
  isEnabled?: boolean | string | null;
  physicalState?: string;
};

export type AddAdminUserParams = {
  email: string;
  communityId: string;
  departmentIds: string[];
  permissionCodes: string[];
  workersInviteAO?: {
    workerRoleIds: string[];
    autoInvite: boolean;
    communityId: string;
    email?: string;
    phone?: string;
    nationalPhone?: string;
    firstName?: string;
    lastName?: string;
  };
};

export type AddAndInviteAdminUserParams = {
  email?: string;
  communityId: string;
  departmentIds: string[];
  permissionCodes: string[];
  redirectUrl: string;
  workersInviteAO?: {
    workerRoleIds: string[];
    autoInvite: boolean;
    communityId: string;
    email?: string;
    phone?: string;
    nationalPhone?: string;
    firstName?: string;
    lastName?: string;
  };
};

export type EditAdminUserParams = {
  id: string;
  userId: string;
  email: string;
  communityId: string;
  departmentIds: string[];
  permissionCodes: string[];
  nationalPhone?: string;
};

export type GetPermissionTreeParams = {
  userId: string;
  communityId: string;
};

export type GetPermissionTreeResponse = {
  id: string;
  level: string;
  type: string;
  code: string;
  parentCode: string;
  displayName: string;
  children: GetPermissionTreeResponse;
}[];

export type InviteAdminUserParams = {
  ids: string[];
  redirectUrl: string;
};

export type CheckAdminUserParams = {
  userId: string;
  communityId: string;
  permissionCodes?: string[];
  departmentIds?: string[];
  reason?: string | undefined | null;
  type: 0 | 1; // 0: REJECT, 1: APPROVE
};

export type GetAdminUserInfoResponse = {
  id: string;
  userId: string;
  communityId: string;
  email: string;
  departmentIds: string[];
  permissionCodes: string[];
  firstName: string;
  lastName: string;
  phone: string;
  nationalPhone: string;
  title: string;
};

export type GetPermissionListResponse = {
  communityId: string;
  id: string;
  permissionCode: string;
  userId: string;
};

export type UnreadPermissionListResponse = {
  id: string;
  level: string;
  type: string;
  code: string;
  parentCode: string;
  displayName: string;
  orderNo: number;
  children: UnreadPermissionListResponse[] | null;
};

export type AddCommunityInput = {
  companyId: string;
  newCompanyName: string;
  name: string;
  startOfWeek: string;
  physicalAddress: string;
  physicalCity: string;
  physicalState: string;
  physicalZip: string;
  mailingAddress: string;
  mailingAddress2: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  billingContact: string;
  billingEmail: string;
  attendanceEnabled: boolean;
  logoFileId?: string;
  locationLat: number;
  locationLng: number;
  buildingTypeList: Array<string>;
  timeZoneId: string;
  addType: "ON_BOARDING" | "CREATE";
};

export interface EditCommunityInput extends AddCommunityInput {
  id: string;
}
