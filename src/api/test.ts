import instance from "@/utils/http";

import { APIResponse } from "./types";

export const checkLocation = (param: any) =>
  instance.get<any, APIResponse<any>>(
    `/api/service/communityRule/map/positioning`,
    {
      params: param,
    }
  );
