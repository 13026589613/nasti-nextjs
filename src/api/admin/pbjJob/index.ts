import {
  CategoryList,
  EditPbjCategotyParams,
  GetPbjJobParams,
  GetPbjJobResponse,
  PbjJobParams,
} from "@/api/admin/pbjJob/type";
import instance from "@/utils/http";

import { APIResponse } from "../../types";

const baseModuleUrl = "/api/service/admin/pbjJob";

const baseUrl = "/api/service/admin/pbjCategory";
export const getPbjJob = (param: GetPbjJobParams) =>
  instance.get<GetPbjJobParams, APIResponse<GetPbjJobResponse>>(
    `${baseModuleUrl}/list/page`,
    {
      params: param,
    }
  );

export const addPbjJob = (data: PbjJobParams) => {
  return instance.post<PbjJobParams, APIResponse<string>>(
    `${baseModuleUrl}/create`,
    data
  );
};

export const editPbjJob = (data: PbjJobParams) => {
  return instance.post<PbjJobParams, APIResponse<string>>(
    `${baseModuleUrl}/edit`,
    data
  );
};

export const deletePbjJob = (data: string) =>
  instance.post<GetPbjJobParams, APIResponse<GetPbjJobResponse>>(
    `${baseModuleUrl}/delete/${data}`
  );
// #####
export const createPbjCategoty = (data: CategoryList[]) => {
  return instance.post<CategoryList[], APIResponse<boolean>>(
    `${baseUrl}/create`,
    data
  );
};

export const deletePbjCategoty = (name: string) => {
  return instance.post<string, APIResponse<string>>(`${baseUrl}/delete`, {
    name,
  });
};

export const editPbjCategoty = (data: EditPbjCategotyParams) => {
  return instance.post<EditPbjCategotyParams, APIResponse<boolean>>(
    `${baseUrl}/edit`,
    data
  );
};

export const getInfoPbjCategoty = (id: string) => {
  return instance.get<string, APIResponse<any>>(`${baseUrl}/info/${id}`);
};

export const listPbjCatrgoty = (name: string) => {
  return instance.post<string, APIResponse<CategoryList[]>>(`${baseUrl}/list`, {
    name,
  });
};

export const getNameListPbjCatrgoty = () => {
  return instance.get<string, APIResponse<any>>(`${baseUrl}/name/list`);
};

export const existsCode = (data: { id?: string | null; code: string }) => {
  return instance.post<string, APIResponse<boolean>>(
    `${baseModuleUrl}/exists/code`,
    data
  );
};
export const existsName = (data: { id?: string | null; name: string }) => {
  return instance.post<string, APIResponse<boolean>>(
    `${baseModuleUrl}/exists/name`,
    data
  );
};
