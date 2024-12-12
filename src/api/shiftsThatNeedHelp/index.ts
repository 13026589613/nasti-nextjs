import {
  EmployeesVo,
  NeedHelpShiftCount,
} from "@/app/(system)/(service)/employees/type";
import instance from "@/utils/http";

import { APIResponse } from "../types";

// base module config
const baseModuleUrl = "/api/service/app";

export const getShiftSwaps = (userId: string) => {
  return instance.get<string, APIResponse<EmployeesVo[]>>(
    `${baseModuleUrl}/shift/swap/getShiftSwapRequestById/${userId}`
  );
};
export const getNeedCoverageCount = (communityId: string) => {
  return instance.get<string, APIResponse<NeedHelpShiftCount>>(
    `/api/service/shift/needCoverage/count`,
    {
      params: { communityId },
      debounce: false,
    }
  );
};
