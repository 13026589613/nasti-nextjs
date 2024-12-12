import {
  AddAdminUserParams,
  AddAndInviteAdminUserParams,
} from "@/app/admin/community/types";
import instance from "@/utils/http";

import { APIResponse } from "../../types";
import {
  CheckAdminUserParams,
  CommunityAdminUserParams,
  CommunityAdminUserResponse,
  EditAdminUserParams,
  EditAndInviteAdminUserParams,
  GetAdminUserInfoResponse,
  InactiveSchdulerUserParams,
  InviteAdminUserParams,
} from "./type";

const baseUrl = "/api/system";
export const getCompanyList = (data?: CommunityAdminUserParams) => {
  return instance.get<
    CommunityAdminUserParams,
    APIResponse<CommunityAdminUserResponse>
  >(`${baseUrl}/admin/scheduler/user/list/page`, { params: data });
};

export const ActiveSchdulerUser = (id: string) => {
  return instance.get<string, APIResponse<boolean>>(
    `${baseUrl}/admin/scheduler/user/active/${id}`
  );
};

export const InactiveSchdulerUser = (params: InactiveSchdulerUserParams) => {
  return instance.get<InactiveSchdulerUserParams, APIResponse<boolean>>(
    `${baseUrl}/admin/scheduler/user/inactive`,
    {
      params,
    }
  );
};

export const addAdminUserAdmin = (data: AddAdminUserParams) => {
  return instance.post<AddAdminUserParams, APIResponse<string>>(
    `${baseUrl}/admin/scheduler/user/create`,
    data
  );
};

export const addAndInviteAdminUserAdmin = (
  data: AddAndInviteAdminUserParams
) => {
  return instance.post<AddAndInviteAdminUserParams, APIResponse<string>>(
    `${baseUrl}/admin/scheduler/user/createAndInvite`,
    data
  );
};

export const editAndInviteAdminUserAdmin = (
  data: EditAndInviteAdminUserParams
) => {
  return instance.post<EditAndInviteAdminUserParams, APIResponse<string>>(
    `${baseUrl}/admin/scheduler/user/editAndInvite`,
    data
  );
};

export const editAdminUserAdmin = (data: EditAdminUserParams) => {
  return instance.post<EditAdminUserParams, APIResponse<string>>(
    `${baseUrl}/user/scheduler/admin/edit`,
    data
  );
};

export const getAdminUserInfoAdmin = (data: string) => {
  return instance.get<string, APIResponse<GetAdminUserInfoResponse>>(
    `${baseUrl}/admin/scheduler/user/info/${data}`
  );
};

export const inviteAdminUserAdmin = (data: InviteAdminUserParams) => {
  return instance.post<InviteAdminUserParams, APIResponse<string>>(
    `${baseUrl}/admin/scheduler/user/sent/invitation`,
    data
  );
};

export const deleteAdminUserAdmin = (data: string) => {
  return instance.post<string, APIResponse<string>>(
    `${baseUrl}/admin/scheduler/user/delete/${data}`
  );
};

export const checkAdminUserAdmin = (data: CheckAdminUserParams) => {
  return instance.post<CheckAdminUserParams, APIResponse<string>>(
    `${baseUrl}/admin/scheduler/user/check`,
    data
  );
};
