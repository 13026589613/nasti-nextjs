import {
  CommunityRuleCodeListResponse,
  CreateCommunityRuleInfoInput,
  CreateCommunityRuleInfoResponse,
  EditCommunityRuleInfoInput,
  GetCommunityRuleInfoResponse,
} from "@/app/(system)/(service)/community/create/scheduleRules/types";
import instance from "@/utils/http";

import { APIResponse } from "../types";

/**
 * @description get communityRule code info
 * @param param
 * @returns
 */
export const getCommunityRuleCodeList = () => {
  return instance.get<string, APIResponse<CommunityRuleCodeListResponse>>(
    `/api/service/communityRule/code/list`
  );
};

/**
 * @description save communityRule info
 * @param param
 * @returns
 */
export const createCommunityRuleInfo = (data: CreateCommunityRuleInfoInput) => {
  return instance.post<
    CreateCommunityRuleInfoInput,
    APIResponse<CreateCommunityRuleInfoResponse>
  >(`/api/service/communityRule/create`, data);
};

/**
 * @description save communityRule info
 * @param param
 * @returns
 */
export const editCommunityRuleInfo = (data: EditCommunityRuleInfoInput) => {
  return instance.post<
    EditCommunityRuleInfoInput,
    APIResponse<CreateCommunityRuleInfoResponse>
  >(`/api/service/communityRule/edit`, data);
};

/**
 * @description get communityRule info
 * @param param
 * @returns
 */
export const getCommunityRuleInfo = (id: string) => {
  return instance.get<string, APIResponse<GetCommunityRuleInfoResponse>>(
    `/api/service/communityRule/detail`,
    {
      params: {
        communityId: id,
      },
    }
  );
};
