import instance from "@/utils/http";

import { APIResponse, ListParams, ListResponse } from "../types";
import {
  GetScheduleTemplateInfoRes,
  GetScheduleTemplateListParams,
  GetScheduleTemplateListRecord,
  GetScheduleTemplateShiftListParams,
  GetScheduleTemplateShiftListRes,
  GetScheduleTemplateShiftRoleListParams,
  ScheduleTemplateCreateParams,
  ScheduleTemplateEditParams,
  ScheduleTemplateShiftCreateParams,
  ScheduleTemplateShiftInfoRes,
  TemplateShiftType,
} from "./types";

export const getScheduleTemplateList = (
  params: GetScheduleTemplateListParams & ListParams
) =>
  instance.get<
    string,
    APIResponse<ListResponse<GetScheduleTemplateListRecord>>
  >(`/api/service/scheduleTemplate/list/page`, {
    params,
  });

export const scheduleTemplateCreate = (data: ScheduleTemplateCreateParams) =>
  instance.post<string, APIResponse<string>>(
    `/api/service/scheduleTemplate/create`,
    data
  );

export const getScheduleTemplateInfo = (templateId: string) =>
  instance.get<string, APIResponse<GetScheduleTemplateInfoRes>>(
    `/api/service/scheduleTemplate/info/${templateId}`
  );

export const scheduleTemplateEdit = (data: ScheduleTemplateEditParams) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/scheduleTemplate/edit`,
    data
  );

// Template Shift
export const getScheduleTemplateShiftList = <T extends TemplateShiftType>(
  params: GetScheduleTemplateShiftListParams
) =>
  instance.get<string, APIResponse<GetScheduleTemplateShiftListRes<T>>>(
    `/api/service/scheduleTemplateShift/list`,
    { params }
  );

export const scheduleTemplateShiftCreate = (
  data: ScheduleTemplateShiftCreateParams
) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/scheduleTemplateShift/create`,
    data
  );

export const scheduleTemplateShiftEdit = (
  data: ScheduleTemplateShiftCreateParams
) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/scheduleTemplateShift/edit`,
    data
  );

export const scheduleTemplateShiftInfo = (shiftId: string) =>
  instance.get<string, APIResponse<ScheduleTemplateShiftInfoRes>>(
    `/api/service/scheduleTemplateShift/info/${shiftId}`
  );

export const getScheduleTemplateShiftRoleList = (
  params: GetScheduleTemplateShiftRoleListParams
) =>
  instance.get<string, APIResponse<any>>(
    `/api/service/scheduleTemplateShift/role/list`,
    { params }
  );

export const getScheduleTemplateCount = (id: string) =>
  instance.get<string, APIResponse<any>>(
    `/api/service/scheduleTemplateShift/count/${id}`
  );

export const deleteScheduleTemplate = (id: string) =>
  instance.post<string, APIResponse<any>>(
    `/api/service/scheduleTemplate/delete/${id}`
  );

export const duplicateScheduleTemplate = (data: { name: string; id: string }) =>
  instance.post<string, APIResponse<any>>(
    `/api/service/scheduleTemplate/duplicate/${data.id}?name=${data.name}`
  );

export const scheduleTemplateShiftDelete = (shiftIds: string) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/scheduleTemplateShift/delete/${shiftIds}`
  );

// /scheduleTemplateShift/batch/edit
export const scheduleTemplateShiftBatchEdit = (data: object) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/scheduleTemplateShift/batch/edit`,
    data
  );

export const joinDepartmentApi = (data: {
  userId: string;
  departmentId: string;
  communityId: string;
}) =>
  instance.post<
    {
      useId: string;
      departmentId: string;
    },
    APIResponse<boolean>
  >(`/api/service/userDepartmentRef/create`, data);
