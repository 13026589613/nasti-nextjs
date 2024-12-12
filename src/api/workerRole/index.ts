import {
  AddWorkerRoleParams,
  EditWorkerRoleParams,
  GetRoleJobRes,
  GetWorkerRoleParams,
  GetWorkerRoleResponse,
  RolesParams,
} from "@/app/(system)/(service)/community/create/workerRole/types";
import instance from "@/utils/http";

import { APIResponse } from "../types";
import { WorkerRoleListRes } from "./types";

// base module config
const baseModuleUrl = "/api/service/workerRole";

/**
 * @description load workerRole list data
 * @param param
 * @returns
 */
export const getWorkerRole = (param: GetWorkerRoleParams) =>
  instance.get<GetWorkerRoleParams, APIResponse<GetWorkerRoleResponse>>(
    `${baseModuleUrl}/list/page`,
    {
      params: param,
    }
  );

/**
 * @description delete workerRole by Id
 * @param param
 * @returns
 */
export const deleteWorkerRole = (data: string) =>
  instance.post<GetWorkerRoleParams, APIResponse<GetWorkerRoleResponse>>(
    `${baseModuleUrl}/delete/${data}`
  );

/**
 * @description add new workerRole info
 * @param param
 * @returns
 */
export const addWorkerRole = (data: AddWorkerRoleParams) => {
  return instance.post<AddWorkerRoleParams, APIResponse<string>>(
    `${baseModuleUrl}/create`,
    data
  );
};

/**
 * @description edit workerRole info
 * @param param
 * @returns
 */
export const editWorkerRole = (data: EditWorkerRoleParams) => {
  return instance.post<EditWorkerRoleParams, APIResponse<string>>(
    `${baseModuleUrl}/edit`,
    data
  );
};

/**
 * @description role select info
 * @param param
 * @returns
 */
export const getRoleJob = (data: string) => {
  return instance.get<string, APIResponse<GetRoleJobRes[]>>(
    `/api/service/pbjJob/list`,
    {
      params: {
        communityId: data,
      },
    }
  );
};
/**
 * @description  job select info
 * @param param
 * @returns
 */
export const getJobCode = (data: string) => {
  return instance.get<string, APIResponse<string>>(
    `/api/service/pbjJob/code/list`,
    {
      params: {
        communityId: data,
      },
    }
  );
};

/**
 * @description enabledRoles by Id
 * @param param
 * @returns
 */
export const enabledRoles = (data: string) =>
  instance.post<GetWorkerRoleParams, APIResponse<GetWorkerRoleResponse>>(
    `${baseModuleUrl}/update/status/${data}`
  );

/**
 * @description get role list no pagination
 * @param param
 * @returns
 */
export const workerRoleList = (
  communityId: string,
  isEnabled = false,
  departmentIds: string | null = null
) => {
  return instance.get<string, APIResponse<WorkerRoleListRes[]>>(
    `/api/service/workerRole/list`,
    {
      params: {
        communityId,
        isEnabled,
        departmentIds,
      },
    }
  );
};

export const getEmployeeList = (data: RolesParams) => {
  return instance.get<RolesParams, APIResponse<any>>(
    `${baseModuleUrl}/employee/list`,
    {
      params: data,
    }
  );
};
export const getDetails = (data: string) => {
  return instance.get<string, APIResponse<GetWorkerRoleResponse>>(
    `${baseModuleUrl}/info/${data}`
  );
};
