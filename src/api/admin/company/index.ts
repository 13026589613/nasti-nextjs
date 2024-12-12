import instance from "@/utils/http";

import { APIResponse } from "../../types";
import { CompanyParams, CompanyResponse, CompanyVo } from "./type";

const baseUrl = "/api/service";
export const getCompanyList = (data?: CompanyParams) => {
  return instance.get<CompanyParams, APIResponse<CompanyResponse>>(
    `${baseUrl}/admin/company/list/page`,
    { params: data }
  );
};
export const getCompanyInfo = (id: string) => {
  return instance.get<string, APIResponse<CompanyVo>>(
    `${baseUrl}/admin/company/info/${id}`
  );
};
export const editCompany = (data: CompanyParams) => {
  return instance.post<CompanyParams, APIResponse<boolean>>(
    `${baseUrl}/admin/company/edit`,
    data
  );
};
export const createCompany = (data: CompanyParams) => {
  return instance.post<CompanyParams, APIResponse<boolean>>(
    `${baseUrl}/admin/company/create`,
    data
  );
};
export const deleteCompany = (id: string) => {
  return instance.post<CompanyParams, APIResponse<boolean>>(
    `${baseUrl}/admin/company/delete/${id}`
  );
};
