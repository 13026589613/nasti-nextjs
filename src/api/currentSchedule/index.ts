import instance from "@/utils/http";

import { APIResponse } from "../types";
import {
  ApplyTemplateParams,
  DepartmentCensusEditParams,
  DepartmentCensusListParams,
  DepartmentCensusListRes,
  DepartmentScheduleRolesParams,
  DepartmentScheduleRolesRes,
  GetScheduleInfoParams,
  GetScheduleInfoRes,
  GetShiftHistoryListRes,
  MonthlyRoleVO,
  PublishScheduleRes,
  PublishShiftRes,
  saveShiftBreakParams,
  ScheduleRole,
  ScheduleShift,
  ScheduleShiftBatchEditParams,
  ScheduleShiftCreateParams,
  ScheduleShiftDepartmentListParams,
  ScheduleShiftDepartmentListRes,
  ScheduleShiftListEmployeeParams,
  ScheduleShiftReviewParams,
  scheduleShiftTemplatePreCheckParams,
  ScheduleTemplateListOptionParams,
  ScheduleTemplateListOptionRes,
  ScheduleUser,
  ShiftTargetHppdAdjustParams,
  UnpublishShift,
} from "./types";

// schedule Shift Create
export const scheduleShiftCreate = (data: ScheduleShiftCreateParams) =>
  instance.post<string, APIResponse<PublishShiftRes>>(
    `/api/service/scheduleShift/create`,
    data
  );

// schedule Shift Edit
export const scheduleShiftEdit = (data: ScheduleShiftCreateParams) =>
  instance.post<string, APIResponse<PublishShiftRes>>(
    `/api/service/scheduleShift/edit`,
    data
  );

// schedule Shift Edit
export const scheduleShiftBatchEdit = (data: ScheduleShiftBatchEditParams) =>
  instance.post<ScheduleShiftBatchEditParams, APIResponse<PublishShiftRes>>(
    `/api/service/scheduleShift/batch/edit`,
    data
  );

export const unPublishShift = (data: UnpublishShift) => {
  return instance.post<UnpublishShift, APIResponse<boolean>>(
    `/api/service/scheduleShift/shift/unpublish`,
    data
  );
};

export const scheduleShiftInfo = (shiftId: string) =>
  instance.get<string, APIResponse<ScheduleShift>>(
    `/api/service/scheduleShift/info/${shiftId}`
  );

export const scheduleShiftList: <T extends "Daily" | "Weekly" | "Monthly">(
  data: ScheduleShiftListEmployeeParams
) => Promise<
  APIResponse<
    T extends "Weekly"
      ? ScheduleRole[]
      : T extends "Daily"
      ? ScheduleRole[]
      : MonthlyRoleVO[]
  >
> = <T extends "Daily" | "Weekly" | "Monthly">(
  data: ScheduleShiftListEmployeeParams
) =>
  instance.post<
    string,
    APIResponse<
      T extends "Weekly"
        ? ScheduleRole[]
        : T extends "Daily"
        ? ScheduleRole[]
        : MonthlyRoleVO[]
    >
  >(`/api/service/scheduleShift/list`, data, {
    debounce: false,
  });

export const scheduleShiftListEmployee = <
  T extends "Daily" | "Weekly" | "Monthly"
>(
  data: ScheduleShiftListEmployeeParams
) =>
  instance.post<
    string,
    APIResponse<
      T extends "Weekly"
        ? ScheduleUser[]
        : T extends "Daily"
        ? ScheduleUser[]
        : ScheduleUser[]
    >
  >(`/api/service/scheduleShift/list/employee`, data, {
    debounce: false,
  });

export const scheduleShiftDepartmentList = (
  data: ScheduleShiftDepartmentListParams
) =>
  instance.post<string, APIResponse<ScheduleShiftDepartmentListRes>>(
    `/api/service/scheduleShift/department/list`,
    data,
    { debounce: false }
  );

export const departmentCensusList = (params: DepartmentCensusListParams) =>
  instance.get<string, APIResponse<DepartmentCensusListRes[]>>(
    `/api/service/departmentCensus/list`,
    {
      params,
    }
  );

export const departmentCensusEdit = (data: DepartmentCensusEditParams) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/departmentCensus/edit`,
    data
  );

export const departmentCensusCreate = (data: DepartmentCensusEditParams) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/departmentCensus/create`,
    data
  );

export const departmentScheduleRoles = (data: DepartmentScheduleRolesParams) =>
  instance.get<string, APIResponse<DepartmentScheduleRolesRes>>(
    `/api/service/scheduleShift/role/list`,
    {
      params: data,
    }
  );

export const shiftTargetHppdAdjust = (data: ShiftTargetHppdAdjustParams) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/shiftTargetHppd/adjust`,
    data
  );

export const applyTemplate = (data: ApplyTemplateParams) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/scheduleShift/apply/template`,
    data
  );

export const scheduleTemplateListOption = (
  data: ScheduleTemplateListOptionParams
) =>
  instance.get<string, APIResponse<ScheduleTemplateListOptionRes[]>>(
    `/api/service/scheduleTemplate/list`,
    {
      params: data,
    }
  );

export const publishSchedule = (scheduleId: string) =>
  instance.post<string, APIResponse<PublishScheduleRes>>(
    `/api/service/scheduleShift/schedule/${scheduleId}/publish`
  );

export const republishSchedule = (scheduleId: string) =>
  instance.post<string, APIResponse<PublishScheduleRes>>(
    `/api/service/scheduleShift/schedule/${scheduleId}/republish`
  );

export const publishErrorConfirmOk = (validateKey: string) => {
  return instance.post<string, APIResponse<boolean>>(
    `/api/service/scheduleShift/confirmPublish/${validateKey}`
  );
};

export const unpublishSchedule = (scheduleId: string) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/scheduleShift/schedule/${scheduleId}/unpublish`
  );

export const getScheduleInfo = (data: GetScheduleInfoParams) =>
  instance.get<string, APIResponse<GetScheduleInfoRes>>(
    `/api/service/schedule/info`,
    {
      params: data,
    }
  );

export const getShiftHistoryList = (data: { shiftId: string }) =>
  instance.get<string, APIResponse<GetShiftHistoryListRes[]>>(
    `/api/service/shiftHistory/list`,
    {
      params: data,
    }
  );

export const scheduleShiftReview = (data: ScheduleShiftReviewParams) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/scheduleShift/review`,
    data
  );

export const scheduleShiftTemplatePreCheck = (
  data: scheduleShiftTemplatePreCheckParams
) =>
  instance.post<
    scheduleShiftTemplatePreCheckParams,
    APIResponse<{ existsData: boolean; existsPublishData: boolean }>
  >(`/api/service/scheduleShift/apply/template/preCheck`, data);

export const scheduleShiftDelete = (shiftIds: string) =>
  instance.post<string, APIResponse<boolean>>(
    `/api/service/scheduleShift/delete/${shiftIds}`
  );

export const saveShiftBreak = (data: saveShiftBreakParams) =>
  instance.post<string, APIResponse<any>>(`/api/service/shiftBreak/save`, data);

export const shiftBreakList = (shiftId: string) =>
  instance.get<string, APIResponse<any>>(`/api/service/shiftBreak/list`, {
    params: {
      shiftId,
    },
  });
