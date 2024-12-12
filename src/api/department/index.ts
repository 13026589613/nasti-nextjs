import {
  AddDepartmentParams,
  DepartmentEmployeeParams,
  DepartmentVo,
  EditDepartmentParams,
  GetDepartmentParams,
  GetDepartmentResponse,
} from "@/app/(system)/(service)/community/create/department/types";
import instance from "@/utils/http";

import { APIResponse } from "../types";

// base module config
const baseModuleUrl = "/api/service/department";

/**
 * @description load department list data
 * @param param
 * @returns
 */
export const getDepartment = (param: GetDepartmentParams) =>
  instance.get<GetDepartmentParams, APIResponse<GetDepartmentResponse>>(
    `${baseModuleUrl}/list/page`,
    {
      params: param,
    }
  );

/**
 * @description delete department by Id
 * @param param
 * @returns
 */
export const deleteDepartment = (data: string) =>
  instance.post<GetDepartmentParams, APIResponse<GetDepartmentResponse>>(
    `${baseModuleUrl}/delete/${data}`
  );

/**
 * @description add new department info
 * @param param
 * @returns
 */
export const addDepartment = (data: AddDepartmentParams) => {
  return instance.post<AddDepartmentParams, APIResponse<string>>(
    `${baseModuleUrl}/create`,
    data
  );
};

/**
 * @description edit department info
 * @param param
 * @returns
 */
export const editDepartment = (data: EditDepartmentParams) => {
  return instance.post<EditDepartmentParams, APIResponse<string>>(
    `${baseModuleUrl}/edit`,
    data
  );
};
/**
 * @description get department select
 * @param param
 * @returns
 */
export const getDepartmentList = (data: string) => {
  return instance.get<string, APIResponse<DepartmentVo[]>>(
    `${baseModuleUrl}/company/other/community/names`,
    {
      params: {
        communityId: data,
      },
    }
  );
};

export const getDepartmentListDropdown = (data: string) => {
  return instance.get<string, APIResponse<DepartmentVo[]>>(
    `${baseModuleUrl}/list`,
    {
      params: {
        communityId: data,
      },
    }
  );
};
/**
 * @description get location select
 * @param param
 * @returns
 */
export const getLocationList = (
  communityId: string,
  isEnabled: boolean = true
) => {
  return instance.get<string, APIResponse<DepartmentVo[]>>(
    `/api/service/location/list`,
    {
      params: {
        communityId,
        isEnabled,
      },
    }
  );
};
/**
 * @description get department details
 * @param param
 * @returns
 */
export const getDetails = (data: string) => {
  return instance.get<string, APIResponse<GetDepartmentResponse>>(
    `${baseModuleUrl}/info/${data}`
  );
};

//type: 0:all 1:self
export const getDptSelect = (data: string, type?: 0 | 1) => {
  return instance.get<string, APIResponse<DepartmentVo[]>>(
    `${baseModuleUrl}/list`,
    {
      params: {
        communityId: data,
        type,
      },
    }
  );
};

/**
 * @description enabledDepartment by Id
 * @param param
 * @returns
 */
export const enabledDepartment = (data: string) =>
  instance.post<GetDepartmentParams, APIResponse<GetDepartmentResponse>>(
    `${baseModuleUrl}/update/status/${data}`
  );

export const getEmployeeList = (data: DepartmentEmployeeParams) => {
  return instance.get<DepartmentEmployeeParams, APIResponse<any>>(
    `${baseModuleUrl}/employee/list`,
    {
      params: data,
    }
  );
};
export const getAdminList = (data: DepartmentEmployeeParams) => {
  return instance.get<DepartmentEmployeeParams, APIResponse<any>>(
    `${baseModuleUrl}/admin/list`,
    {
      params: data,
    }
  );
};

export const workerRoleDepartmentList = (params: any) => {
  return instance.get<string, APIResponse<any>>(
    `${baseModuleUrl}/workerRoleDepartmentRef/list/page`,
    {
      params,
    }
  );
};
