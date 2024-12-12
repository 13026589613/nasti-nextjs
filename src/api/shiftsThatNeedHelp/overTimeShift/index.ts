import instance from "@/utils/http";

import { APIResponse, ListResponse } from "../../types";
import { OvertimeShiftVO } from "./type";

// base module config
// const baseModuleUrl = "/api/service/app";
export const getOvertimeShifts = (params: {
  communityId: string | null;
  departmentIds: string | null;
  workerRoleId: string | null;
  userId: string | null;
  status: string | null;
  pageNum: number;
  pageSize: number;
}) => {
  return instance.get<string, APIResponse<ListResponse<OvertimeShiftVO>>>(
    `/api/service/shift/overtime/list/page`,
    { params }
  );
};

export const getOvertimeShiftsDetail = (id: string) => {
  return instance.get<string, APIResponse<OvertimeShiftVO>>(
    `/api/service/shift/overtime/info/${id}`
  );
};

export const overtimeBatch = (data: {
  shiftId: string[];
  comment?: string;
  status: "APPROVED" | "REJECT";
}) => {
  return instance.post<string, APIResponse<any>>(
    `/api/service/shift/overtime/batch/review`,
    data
  );
};
