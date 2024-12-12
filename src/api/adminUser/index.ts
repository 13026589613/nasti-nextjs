import {
  AddAdminUserParams,
  AddAndInviteAdminUserParams,
  CheckAdminUserParams,
  CheckIsWorkerExistsReq,
  EditAdminUserParams,
  EditAndInviteAdminUserParams,
  GetAdminUserInfoResponse,
  GetPermissionListResponse,
  GetPermissionTreeParams,
  GetPermissionTreeResponse,
  GetUserAdminUserParams,
  GetUserAdminUserResponse,
  InviteAdminUserParams,
  UnreadPermissionListResponse,
} from "@/app/(system)/(service)/adminUser/types";
import instance from "@/utils/http";

import { APIResponse } from "../types";
const baseUrl = "/api/system";
export const getAdminUserList = (data: GetUserAdminUserParams) => {
  return instance.get<
    GetUserAdminUserParams,
    APIResponse<GetUserAdminUserResponse>
  >(`${baseUrl}/user/scheduler/admin/list/page`, {
    params: data,
  });
};

export const getPermissionTree = (data: GetPermissionTreeParams) => {
  return instance.get<
    GetPermissionTreeParams,
    APIResponse<GetPermissionTreeResponse>
  >(`${baseUrl}/permission/grant/allow/permission`, {
    params: data,
  });
};

export const addAdminUser = (data: AddAdminUserParams) => {
  return instance.post<AddAdminUserParams, APIResponse<string>>(
    `${baseUrl}/user/scheduler/admin/create`,
    data
  );
};

export const addAndInviteAdminUser = (data: AddAndInviteAdminUserParams) => {
  return instance.post<AddAndInviteAdminUserParams, APIResponse<string>>(
    `${baseUrl}/user/scheduler/admin/createAndInvite`,
    data
  );
};

export const editAdminUser = (data: EditAdminUserParams) => {
  return instance.post<EditAdminUserParams, APIResponse<string>>(
    `${baseUrl}/user/scheduler/admin/edit`,
    data
  );
};

export const editAndInviteAdminUser = (data: EditAndInviteAdminUserParams) => {
  return instance.post<EditAndInviteAdminUserParams, APIResponse<string>>(
    `${baseUrl}/user/scheduler/admin/editAndInvite`,
    data
  );
};

export const inviteAdminUser = (data: InviteAdminUserParams) => {
  return instance.post<InviteAdminUserParams, APIResponse<string>>(
    `${baseUrl}/user/scheduler/admin/sent/invitation`,
    data
  );
};

export const deleteAdminUser = (data: string) => {
  return instance.post<string, APIResponse<string>>(
    `${baseUrl}/user/scheduler/admin/delete/${data}`
  );
};

export const activeAdminUser = (data: string) => {
  return instance.post<string, APIResponse<string>>(
    `${baseUrl}/user/scheduler/admin/active/${data}`
  );
};

export const inactiveAdminUser = (data: {
  id: string;
  terminationDate: string;
}) => {
  return instance.post<
    {
      id: string;
      terminationDate: string;
    },
    APIResponse<string>
  >(`${baseUrl}/user/scheduler/admin/inactive`, data);
};

export const checkAdminUser = (data: CheckAdminUserParams) => {
  return instance.post<CheckAdminUserParams, APIResponse<string>>(
    // `${baseUrl}/user/admin/check`,
    `${baseUrl}/user/scheduler/admin/check`,
    data
  );
};

export const getAdminUserInfo = (data: string) => {
  return instance.get<string, APIResponse<GetAdminUserInfoResponse>>(
    `${baseUrl}/user/scheduler/admin/info/${data}`
  );
};

export const getPermissionList = (data: string) => {
  return instance.get<string, APIResponse<GetPermissionListResponse[]>>(
    `/api/service/permissionGrant/user/grantedPermissions/${data}`
  );
};

export const unreadPermissionList = (params: {
  level: string;
  type?: string; //MENU
}) => {
  return instance.get<string, APIResponse<UnreadPermissionListResponse[]>>(
    `/api/system/permission/list`,
    { params }
  );
};

export const updateInfo4Invite = (data: {
  firstName: string;
  lastName: string;
  phone: string;
  nationalPhone: string;
  title: string;
}) => {
  return instance.post<string, APIResponse<boolean>>(
    `/api/system/user/updateInfo4Invite`,
    data
  );
};

export const checkIsWorkerExists = (data: CheckIsWorkerExistsReq) => {
  return instance.post<CheckIsWorkerExistsReq, APIResponse<boolean>>(
    `${baseUrl}/user/scheduler/exists/userWorker`,
    data
  );
};
