import {
  GetTemplateParams,
  GetTypeSchedulePlannerParams,
  GetTypeSchedulePlannerResponse,
} from "@/app/(system)/(service)/schedulePlanner/type";
import instance from "@/utils/http";

import { APIResponse } from "../types";

const baseModuleUrl = "/api/service/schedule";

export const getPlanPage = (data: GetTypeSchedulePlannerParams) =>
  instance.get<
    GetTypeSchedulePlannerParams,
    APIResponse<GetTypeSchedulePlannerResponse>
  >(`${baseModuleUrl}/plan/list`, {
    params: data,
  });

export const deleteData = (data: string[]) => {
  return instance.post<string[], APIResponse<string>>(
    `${baseModuleUrl}/delete/${data.join(",")}`
  );
};

export const getTemplateSelect = (data: GetTemplateParams) => {
  return instance.get<GetTemplateParams, APIResponse<string>>(
    `/api/service/scheduleTemplate/list`,
    {
      params: data,
    }
  );
};
