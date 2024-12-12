import {
  AddCommunityInput,
  CompanyResponse,
  EditCommunityInput,
  GetCommunityInfoResponse,
  GetCommunityIsConfirmResponse,
  GetCommunityParams,
  GetCommunityResponse,
  GetTimeZoneResponse,
  RegionsParam,
  RegionsResponse,
} from "@/app/(system)/(service)/community/types";
import instance from "@/utils/http";

import { APIResponse } from "../types";

// base module config
const baseModuleUrl = "/api/service/community";

/**
 * @description load community list data
 * @param param
 * @returns
 */
export const getCommunity = (param: GetCommunityParams) =>
  instance.get<GetCommunityParams, APIResponse<GetCommunityResponse>>(
    `${baseModuleUrl}/list/page`,
    {
      params: param,
    }
  );

/**
 * @description delete community by Id
 * @param param
 * @returns
 */
export const deleteCommunity = (data: string) =>
  instance.post<GetCommunityParams, APIResponse<GetCommunityResponse>>(
    `${baseModuleUrl}/delete/${data}`
  );

/**
 * @description add new community info
 * @param param
 * @returns
 */
export const addCommunity = (data: AddCommunityInput) => {
  return instance.post<AddCommunityInput, APIResponse<string>>(
    `${baseModuleUrl}/create`,
    data
  );
};

/**
 * @description edit community info
 * @param param
 * @returns
 */
export const editCommunity = (data: EditCommunityInput) => {
  return instance.post<EditCommunityInput, APIResponse<string>>(
    `${baseModuleUrl}/edit`,
    data
  );
};
/**
 * @description get regions info
 * @param param
 * @returns
 */
export const getRegionsList = (data: RegionsParam) => {
  return instance.get<RegionsParam, APIResponse<RegionsResponse>>(
    `api/system/regions/dropdown/list`,
    { params: data }
  );
};

/**
 * @description dictionary info
 * @param param
 * @returns
 */
export const getDataByCode = (data: string) => {
  return instance.get<string, APIResponse<RegionsResponse>>(
    `/api/system/dictData/getDataByCode/${data}`
  );
};
/**
 * @description get Company List
 * @param param
 * @returns
 */
export const getCompanyList = (data: string) => {
  return instance.get<string, APIResponse<CompanyResponse>>(
    `/api/service/company/dropdown/list`,
    {
      params: {
        keywords: data,
      },
    }
  );
};

/**
 * @description get Community Info
 * @param param
 * @returns
 */
export const getCommunityInfo = (id: string) => {
  return instance.get<string, APIResponse<GetCommunityInfoResponse>>(
    `/api/service/community/info/${id}`
  );
};

/**
 * @description get regions info
 * @param param
 * @returns
 */
export const getTimeZone = () => {
  return instance.get<string, APIResponse<GetTimeZoneResponse>>(
    `/api/service/community/timezone/list`
  );
};

/**
 * @description load community list data
 * @param param
 * @returns
 */
export const getCommunityAllList = (param: {}) =>
  instance.get<GetCommunityParams, APIResponse<GetCommunityResponse>>(
    `${baseModuleUrl}/list`,
    {
      params: param,
    }
  );

export const getCommunityList = (companyId?: string) => {
  return instance.get<
    unknown,
    APIResponse<
      {
        id: string;
        name: string;
        companyId: string;
      }[]
    >
  >(`/api/service/pub/community/list`, {
    params: {
      companyId,
    },
  });
};

export const getCompanyListPub = () => {
  return instance.get<
    unknown,
    APIResponse<
      {
        id: string;
        name: string;
      }[]
    >
  >(`/api/service/pub/company/list`);
};

export const getCommunityIsConfirm = (communityId: string) => {
  return instance.get<string, APIResponse<GetCommunityIsConfirmResponse>>(
    `/api/service/community/step/data/${communityId}`
  );
};
