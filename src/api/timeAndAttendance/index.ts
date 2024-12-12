import {
  TimeAndAttendanceListApiParamsVO,
  TimeAndAttendanceListApiResVO,
  TimeAndAttendanceReviewApiDataVO,
} from "@/app/(system)/(service)/timeAndAttendance/types";
import instance from "@/utils/http";

import { APIResponse, ListResponse } from "../types";

// base module config
const baseModuleUrl = "/api/service";

export const getTimeAndAttendanceList = (
  params: TimeAndAttendanceListApiParamsVO
) => {
  return instance.get<
    string,
    APIResponse<ListResponse<TimeAndAttendanceListApiResVO>>
  >(`${baseModuleUrl}/shiftAttendance/list/page`, { params });
};

export const getTimeAndAttendanceInfo = (id: string) => {
  return instance.get<string, APIResponse<TimeAndAttendanceListApiResVO>>(
    `${baseModuleUrl}/shiftAttendance/info/${id}`
  );
};

export const timeAndAttendanceReview = (
  data: TimeAndAttendanceReviewApiDataVO
) => {
  return instance.post<string, APIResponse<any>>(
    `${baseModuleUrl}/shiftAttendance/review`,
    data
  );
};

export const timeAndAttendanceUpdate = (data: {
  shiftId: string;
  communityId: string;
  checkInTime: string | null;
  checkOutTime: string | null;
}) => {
  return instance.post<string, APIResponse<any>>(
    `${baseModuleUrl}/shiftAttendance/shift/update`,
    data
  );
};

export const timeAndAttendanceReviewBreak = (data: {
  reviewId: string;
  comment: string;
}) => {
  return instance.post<string, APIResponse<any>>(
    `${baseModuleUrl}/shiftBreak/review`,
    data
  );
};

export const getUnreadAttendanceCount = (communityId: string) => {
  return instance.get<string, APIResponse<number>>(
    `/api/service/shiftAttendance/count`,
    {
      params: {
        communityId,
      },
    }
  );
};
