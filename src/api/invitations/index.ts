import instance from "@/utils/http";

import { APIResponse } from "../types";
import { GetInviteListParams, GetInviteListResponse } from "./type";

export const getInviteList = (param: GetInviteListParams) =>
  instance.get<GetInviteListParams, APIResponse<GetInviteListResponse>>(
    `/api/system/user/invite/list/page`,
    {
      params: param,
    }
  );

export const getInvitePendingCount = () =>
  instance.get<any, APIResponse<number>>(
    `/api/system/user/invite/pending/count`
  );
