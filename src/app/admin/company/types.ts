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
export type CompanyVo = {
  id: string; // id
  userId: string; // userId
  firstName: string; // firstName
  lastName: string; // lastName
  email: string; // email
  phone: string; // phone
  title: string; // title
  terminationDate: string; // terminationDate
  status: keyof typeof ADMIN_USER_STATUS; // status
  statusName: string; // statusName
  community: CommunityInner[]; // community
  departmentListVos: DepartmentListVos[];
  displayNames: string;
  createdAt: string; // createdAt
  createdBy: string; // createdBy
  updatedAt: string; // updatedAt
  updatedBy: string; // updatedBy
  isDeleted: boolean; // isDeleted
  communityId: string; // communityId
};

/**
 * @description Operate Type
 */
export type AdminUserRef = Omit<
  CompanyVo,
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
export type GetUserAdminUserResponse = ListResponse<CompanyVo>;

/**
 * @description Search
 */
export type CompanySearchParams = {
  roleId?: string;
  status?: keyof typeof ADMIN_USER_STATUS;
  name?: string;
  email?: string;
  title?: string;
  condition?: string;
  isActive?: boolean | string | null;
};

export type AddAdminUserParams = {
  email: string;
  communityId: string;
  departmentIds: string[];
  permissionCodes: string[];
};

export type AddAndInviteAdminUserParams = {
  email: string;
  communityId: string;
  departmentIds: string[];
  permissionCodes: string[];
  redirectUrl: string;
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

export type GetCompanyParams = {};
