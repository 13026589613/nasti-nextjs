import {
  CheckTimeOffParams,
  GetTimeOffListParams,
  TimeOffVo,
} from "@/app/(system)/(service)/timeOff/types";
import instance from "@/utils/http";

import { PublishScheduleRes } from "../currentSchedule/types";
import { APIResponse, ListResponse } from "../types";
import {
  UserTimeOffRequestHandleShiftRes,
  UserTimeOffShiftEditReq,
} from "./types";

export const getTimeOffList = (data: GetTimeOffListParams) =>
  instance.post<string, APIResponse<ListResponse<TimeOffVo>>>(
    `/api/service/userTimeOffRequest/list/page`,
    data
  );

export const checkTimeOff = (data: CheckTimeOffParams) => {
  return instance.post<string, APIResponse<boolean>>(
    `/api/service/userTimeOffRequest/batch/audit`,
    data
  );
};

export const userTimeOffRequestCount = (communityId: string) => {
  return instance.get<string, APIResponse<string>>(
    `/api/service/userTimeOffRequest/pending/count`,
    {
      params: {
        communityId: communityId,
      },
    }
  );
};

export const userTimeOffRequestHandleShift = (timeIds: string) => {
  return instance.get<
    UserTimeOffRequestHandleShiftRes[],
    APIResponse<UserTimeOffRequestHandleShiftRes[]>
  >(`/api/service/userTimeOffRequest/handle/shift`, {
    params: {
      timeIds,
    },
  });
};

export const userTimeOffShiftEdit = (data: UserTimeOffShiftEditReq) =>
  instance.post<string, APIResponse<PublishScheduleRes>>(
    `/api/service/scheduleShift/edit`,
    data
  );
