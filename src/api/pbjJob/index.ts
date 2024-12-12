import {
  AddPbjJobParams,
  EditPbjJobParams,
  GetPbjJobParams,
  GetPbjJobResponse,
} from "@/app/(system)/(admin)/pbjJob/types";
import instance from "@/utils/http";

import { APIResponse } from "../types";

// base module config
const baseModuleUrl = "/api/service/admin/pbjJob";

/**
 * @description load pbjJob list data
 * @param param
 * @returns
 */
export const getPbjJob = (param: GetPbjJobParams) =>
  instance.get<GetPbjJobParams, APIResponse<GetPbjJobResponse>>(
    `${baseModuleUrl}/list/page`,
    {
      params: param,
    }
  );

/**
 * @description delete pbjJob by Id
 * @param param
 * @returns
 */
export const deletePbjJob = (data: string) =>
  instance.post<GetPbjJobParams, APIResponse<GetPbjJobResponse>>(
    `${baseModuleUrl}/delete/${data}`
  );

/**
 * @description add new pbjJob info
 * @param param
 * @returns
 */
export const addPbjJob = (data: AddPbjJobParams) => {
  return instance.post<AddPbjJobParams, APIResponse<string>>(
    `${baseModuleUrl}/create`,
    data
  );
};

/**
 * @description edit pbjJob info
 * @param param
 * @returns
 */
export const editPbjJob = (data: EditPbjJobParams) => {
  return instance.post<EditPbjJobParams, APIResponse<string>>(
    `${baseModuleUrl}/edit`,
    data
  );
};
