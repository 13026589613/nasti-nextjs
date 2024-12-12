import instance from "@/utils/http";

import { APIResponse } from "../../types";
import { InvitationResponse, UserListResponse, UserParams } from "./type";

const baseUrl = "/api/system";

export const addUser = (data: UserParams) => {
  return instance.post<UserParams, APIResponse<boolean>>(
    `${baseUrl}/super/admin/user/create`,
    data
  );
};

export const deleteUser = (data: string) => {
  return instance.post<string[], APIResponse<boolean>>(
    `${baseUrl}/super/admin/user/delete/${data}`
  );
};

export const editUser = (data: UserParams) => {
  return instance.post<UserParams, APIResponse<boolean>>(
    `${baseUrl}/super/admin/user/edit`,
    data
  );
};
export const getUserList = (data?: UserParams) => {
  return instance.get<UserParams, APIResponse<UserListResponse>>(
    `${baseUrl}/super/admin/user/list/page`,
    { params: data }
  );
};
export const updateUserState = (userId: string) => {
  return instance.post<boolean, APIResponse<boolean>>(
    `${baseUrl}/super/admin/user/state/update/${userId}`
  );
};
export const sentInitation = (data: InvitationResponse) => {
  return instance.post<boolean, APIResponse<boolean>>(
    `${baseUrl}/super/admin/user/sent/invitation`,
    data
  );
};
