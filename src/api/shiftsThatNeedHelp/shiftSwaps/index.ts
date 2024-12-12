import { GetShiftSwapsReq } from "@/app/(system)/(service)/shiftsNeedHelp/types";
import instance from "@/utils/http";

import { APIResponse, ListResponse } from "../../types";
import { shiftSwapResVO } from "./type";

// base module config
// const baseModuleUrl = "/api/service/app";

export const getShiftSwaps = (params: GetShiftSwapsReq) => {
  return instance.get<
    GetShiftSwapsReq,
    APIResponse<ListResponse<shiftSwapResVO>>
  >(`/api/service/scheduleShift/swap/getSwapReviewList`, { params });
};

export const getShiftSwapsDetail = (params: {
  reviewId: string;
  communityId: string;
}) => {
  return instance.get<string, APIResponse<shiftSwapResVO>>(
    `/api/service/scheduleShift/swap/getSwapReviewInfo`,
    {
      params,
    }
  );
};

export const rejectShiftSwap = (data: {
  reviewId: string;
  comment: string;
}) => {
  return instance.post<string, APIResponse>(
    `/api/service/scheduleShift/swap/rejectedByScheduler`,
    data
  );
};

export const approveShiftSwap = (data: {
  requestId: string;
  comment: string | null;
}) => {
  return instance.post<string, APIResponse>(
    `/api/service/scheduleShift/swap/approvedByScheduler`,
    data
  );
};
