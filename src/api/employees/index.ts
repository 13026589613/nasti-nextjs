import axios from "axios";

import {
  AddEmployeeByAdminParams,
  AddTypeEmployeeParams,
  EditTypeEmployeeParams,
  EmployeesVo,
  GetTypeEmployeeParams,
  GetTypeEmployeeResponse,
  ShiftListParams,
  shiftListResponse,
  timeOffInfoResponseVo,
  TimeOffListParams,
  timeOffListResponse,
} from "@/app/(system)/(service)/employees/type";
import { apiBaseUrl } from "@/env";
import useTokenStore from "@/store/useTokenStore";
import instance from "@/utils/http";

import { APIResponse } from "../types";

// base module config
const baseModuleUrl = "/api/service/userWorker";

/**
 * @description load employee list data
 * @param param
 * @returns
 */
export const getEmployeeListPage = (param: GetTypeEmployeeParams) =>
  instance.get<GetTypeEmployeeParams, APIResponse<GetTypeEmployeeResponse>>(
    `${baseModuleUrl}/list/page`,
    {
      params: param,
    }
  );

/**
 * @description delete employee by Id
 * @param param
 * @returns
 */
export const deleteEmployeeById = (data: string) =>
  instance.post<GetTypeEmployeeParams, APIResponse<GetTypeEmployeeResponse>>(
    `${baseModuleUrl}/delete/${data}`
  );

/**
 * @description add new employee info
 * @param param
 * @returns
 */
export const addEmployee = (data: AddTypeEmployeeParams) => {
  return instance.post<AddTypeEmployeeParams, APIResponse<string>>(
    `${baseModuleUrl}/create`,
    data
  );
};

/**
 * @description edit employee info
 * @param param
 * @returns
 */
export const editEmployee = (data: EditTypeEmployeeParams) => {
  return instance.post<EditTypeEmployeeParams, APIResponse<string>>(
    `${baseModuleUrl}/edit`,
    data
  );
};
/**
 * @description get employee select
 * @param param
 * @returns
 */
export const getEmployeeSelect = (data: string) => {
  return instance.get<string, APIResponse<EmployeesVo[]>>(
    `${baseModuleUrl}/dropdown/list`,
    {
      params: {
        communityId: data,
      },
    }
  );
};
/**
 * @description get role work select
 * @param param
 * @returns
 */
export const getworkerRoleSelect = (data: string) => {
  return instance.get<string, APIResponse<EmployeesVo[]>>(
    `/api/service/workerRole/list`,
    {
      params: {
        communityId: data,
      },
    }
  );
};

/**
 * @description get work details
 * @param param
 * @returns
 */
export const getWorkDetails = (userId: string, data: string) => {
  return instance.get<string, APIResponse<EmployeesVo[]>>(
    `${baseModuleUrl}/info/${userId}`,
    {
      params: {
        communityId: data,
      },
    }
  );
};

/**
 * @description bulk send invite
 * @param param
 * @returns
 */
export const bulkSendInvitation = (
  data: EditTypeEmployeeParams[],
  communityId: string
) => {
  return instance.post<EditTypeEmployeeParams[], APIResponse<string>>(
    `${baseModuleUrl}/community/${communityId}/batchSendInvitation`,
    data
  );
};

/**
 * @description batchEdit
 * @param param
 * @returns
 */
export const batchEdit = (data: EditTypeEmployeeParams) => {
  return instance.post<EditTypeEmployeeParams, APIResponse<string>>(
    `${baseModuleUrl}/batchEdit`,
    data
  );
};

/**
 * @description editInvite
 * @param param
 * @returns
 */
export const editInvite = (data: EditTypeEmployeeParams) => {
  return instance.post<EditTypeEmployeeParams, APIResponse<string>>(
    `${baseModuleUrl}/editInvite`,
    data
  );
};

/**
 * @description download Template
 * @param data
 * @returns
 */
export const downloadTemplate = (data: string) => {
  return instance.get<string, APIResponse<string>>(
    `${baseModuleUrl}/download/importTemplate?communityId=${data}`,
    {
      responseType: "blob",
    }
  );
};

/**
 * @description importData
 * @param param
 * @returns
 */
export const importEmployeesData = (communityId: string, data: File) => {
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
    `${baseModuleUrl}/importData/${communityId}`,
    { file: data }
  );
};

export const deleteData = (data: string[]) => {
  return instance.post<string[], APIResponse<string>>(
    `${baseModuleUrl}/delete/${data.join(",")}`
  );
};

export const shiftList = (data: ShiftListParams) => {
  return instance.post<string[], APIResponse<shiftListResponse>>(
    `/api/service/scheduleShift/employees/alone`,
    data
  );
};

export const timeOffList = (data: TimeOffListParams) => {
  return instance.post<string[], APIResponse<timeOffListResponse>>(
    `/api/service/userTimeOffRequest/employees/alone`,
    data
  );
};

export const employeeTimeOffInfo = (id: string) => {
  return instance.get<string[], APIResponse<timeOffInfoResponseVo>>(
    `/api/service/userTimeOffRequest/info/${id}`
  );
};

export const AddEmployeeByAdmin = (data: AddEmployeeByAdminParams) => {
  return instance.post<AddEmployeeByAdminParams, APIResponse<string>>(
    `${baseModuleUrl}/invite`,
    data
  );
};
