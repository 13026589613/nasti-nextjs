import {
  AddCompanyParams,
  EditCompanyParams,
  GetCompanyParams,
  GetCompanyResponse,
} from "@/app/(system)/(service)/company/types";
import instance from "@/utils/http";

import { APIResponse } from "../types";

// base module config
const baseModuleUrl = "/api/service/company";

/**
 * @description load company list data
 * @param param
 * @returns
 */
export const getCompany = (param: GetCompanyParams) =>
  instance.get<GetCompanyParams, APIResponse<GetCompanyResponse>>(
    `${baseModuleUrl}/list/page`,
    {
      params: param,
    }
  );

/**
 * @description delete company by Id
 * @param param
 * @returns
 */
export const deleteCompany = (data: string) =>
  instance.post<GetCompanyParams, APIResponse<GetCompanyResponse>>(
    `${baseModuleUrl}/delete/${data}`
  );

/**
 * @description add new company info
 * @param param
 * @returns
 */
export const addCompany = (data: AddCompanyParams) => {
  return instance.post<AddCompanyParams, APIResponse<string>>(
    `${baseModuleUrl}/create`,
    data
  );
};

/**
 * @description edit company info
 * @param param
 * @returns
 */
export const editCompany = (data: EditCompanyParams) => {
  return instance.post<EditCompanyParams, APIResponse<string>>(
    `${baseModuleUrl}/edit`,
    data
  );
};
