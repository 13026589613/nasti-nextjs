import {
  GetTimeZoneResponse,
  RegionsParam,
  RegionsResponse,
} from "@/app/(system)/(service)/community/types";
import {
  AddCommunityInput,
  EditCommunityInput,
} from "@/app/(system)/(service)/community/types";
import instance from "@/utils/http";

import { APIResponse } from "../../types";
import {
  CommunityResponse,
  CommunitySearchParams,
  CommunityVo,
  CompanyResponse,
} from "./type";
const baseUrl = "/api/service";

export const getCommunityList = (data?: CommunitySearchParams) => {
  return instance.get<CommunitySearchParams, APIResponse<CommunityResponse>>(
    `${baseUrl}/admin/community/list/page`,
    { params: data }
  );
};
export const getCommunityInfo = (id: string) => {
  return instance.get<string, APIResponse<CommunityVo>>(
    `${baseUrl}/admin/community/info/${id}`
  );
};

export const updateCommunityState = (id: string) => {
  return instance.post<string, APIResponse<boolean>>(
    `${baseUrl}/admin/community/state/update/${id}`
  );
};

export const deleteCommunity = (id: string) => {
  return instance.post<string, APIResponse<boolean>>(
    `${baseUrl}/admin/community/delete/${id}`
  );
};

export const getCompanyList = (data: string) => {
  return instance.get<string, APIResponse<CompanyResponse>>(
    `${baseUrl}/admin/company/dropdown/list`,
    {
      params: {
        keywords: data,
      },
    }
  );
};

export const getTimeZone = () => {
  return instance.get<string, APIResponse<GetTimeZoneResponse>>(
    `${baseUrl}/admin/community/timezone/list`
  );
};

/**
 * @description dictionary info
 * @param param
 * @returns
 */
export const getDataByCode = (data: string) => {
  return instance.get<string, APIResponse<RegionsResponse>>(
    `${baseUrl}/admin/dictData/getDataByCode/${data}`
  );
};

/**
 * @description get regions info
 * @param param
 * @returns
 */
export const getRegionsList = (data: RegionsParam) => {
  return instance.get<RegionsParam, APIResponse<RegionsResponse>>(
    `api/system/admin/regions/dropdown/list`,
    { params: data }
  );
};

export const addCommunity = (data: AddCommunityInput) => {
  return instance.post<AddCommunityInput, APIResponse<string>>(
    `${baseUrl}/admin/community/create`,
    data
  );
};

export const editCommunity = (data: EditCommunityInput) => {
  return instance.post<EditCommunityInput, APIResponse<string>>(
    `${baseUrl}/admin/community/edit`,
    data
  );
};
