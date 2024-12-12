import { ADMIN_USER_STATUS } from "@/constant/statusConstants";

export type ListParams = {
  orderBy?: string;
  pageSize?: number;
  pageNum?: number;
};

export interface CommunityAdminUserParams extends ListParams {
  communityId?: string;
  companyId?: string;
  departmentId?: string[];
  roleId?: string;
  name?: string;
  status?: number;
  title?: string;
  departmentName?: string;
  email?: string;
  condition?: string;
}

export interface CommunityAdminUserResponse {
  size: number;
  records: RecordVo[];
  current: number;
  total: number;
  pages: number;
}
export interface RecordVo {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: keyof typeof ADMIN_USER_STATUS; // status
  title: string;
  phone: string;
  nationalPhone: string;
  terminationDate: string;
  statusName: string;
  community: Community[];
  departmentListVos: DepartmentListVo[];
  displayNames: string[];
}
export interface DepartmentListVo {
  id: string;
  name: string;
}
interface Community {
  id: string;
  communityName: string;
  companyName: string;
}

export interface InactiveSchdulerUserParams {
  id: string;
  title: string;
  terminationDate: string;
}

export type CommunityAdminUserSearchParams = {
  departmentId?: string;
  roleId?: string;
  status?: keyof typeof ADMIN_USER_STATUS;
  name?: string;
  email?: string;
  title?: string;
  condition?: string;
  communityId?: string;
  companyId?: string;
};

export type AddAndInviteAdminUserParams = {
  email?: string;
  communityId: string;
  departmentIds: string[];
  permissionCodes: string[];
  redirectUrl: string;
};

export type EditAndInviteAdminUserParams = {
  userId: string;
  id: string;
  email?: string;
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
  portraitFileId: string;
};

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
