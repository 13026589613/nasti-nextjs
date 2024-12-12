import axios from "axios";

import { apiBaseUrl } from "@/env";
import useTokenStore from "@/store/useTokenStore";
import instance from "@/utils/http";

import { APIResponse } from "../../types";
import {
  AddEmployeeAdminReq,
  EditEmployeeAdminReq,
  editInviteAdminReq,
  GetRoleListApi,
  UserEmployessParams,
  UserEmployessResponse,
} from "./type";
const baseUrl = "/api/service";

export const getUserEmployessList = (params?: UserEmployessParams) => {
  return instance.get<UserEmployessParams, APIResponse<UserEmployessResponse>>(
    `${baseUrl}/admin/userWorker/list/page`,
    { params }
  );
};

export const addEmployeeAdmin = (data: AddEmployeeAdminReq) => {
  return instance.post<AddEmployeeAdminReq, APIResponse<string>>(
    `${baseUrl}/admin/userWorker/create`,
    data
  );
};

export const editInviteAdmin = (data: editInviteAdminReq) => {
  return instance.post<editInviteAdminReq, APIResponse<string>>(
    `${baseUrl}/admin/userWorker/editInvite`,
    data
  );
};

export const editEmployeeAdmin = (data: EditEmployeeAdminReq) => {
  return instance.post<EditEmployeeAdminReq, APIResponse<string>>(
    `${baseUrl}/admin/userWorker/edit`,
    data
  );
};

export const getRoleListApi = (communityId: string) => {
  return instance.get<string, APIResponse<GetRoleListApi[]>>(
    `${baseUrl}/global/admin/role/list`,
    {
      params: {
        communityId,
      },
    }
  );
};

export const bulkSendInvitationAdmin = (data: string[]) => {
  return instance.post<string[], APIResponse<string>>(
    `${baseUrl}/admin/userWorker/community/batchSendInvitation`,
    data
  );
};

export const deleteDataAdmin = (data: string[]) => {
  return instance.post<string[], APIResponse<string>>(
    `${baseUrl}/admin/userWorker/delete/${data.join(",")}`
  );
};

export const downloadTemplateAdmin = (data: string) => {
  return instance.get<string, APIResponse<string>>(
    `${baseUrl}/admin/userWorker/download/importTemplate?communityId=${data}`,
    {
      responseType: "blob",
    }
  );
};

export const importEmployeesDataAdmin = (communityId: string, data: File) => {
  const accessToken = useTokenStore.getState().accessToken;
  const instance = axios.create({
    baseURL: apiBaseUrl,
    timeout: 5 * 60 * 1000,
    headers: {
      "Content-Type": "multipart/form-data",
      authorization: accessToken,
    },
  });
  return instance.post<string, APIResponse<string>>(
    `${baseUrl}/admin/userWorker/importData/${communityId}`,
    { file: data }
  );
};
