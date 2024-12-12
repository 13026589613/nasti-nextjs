import {
  RegionsParam,
  RegionsResponse,
} from "@/app/(system)/(service)/community/types";
import instance, { googleMapInstance } from "@/utils/http";

import { APIResponse } from "../types";

/**
 * @description Get City / State list data
 * @param param city - 2 state - 1
 * @returns
 */
export const getRegionsListData = (data: RegionsParam) => {
  return instance.get<RegionsParam, APIResponse<RegionsResponse>>(
    `api/system/regions/dropdown/list`,
    { params: data }
  );
};

export const uploadFile = (data: any) => {
  return instance.post<any, any>(`api/service/upload/uploadFile`, data, {
    headers: {
      "Content-Type":
        "multipart/form-data; boundary=----WebKitFormBoundarygPP2rqODACTHb1pv",
      // "Accept-Language": "en-US",
    },
  });
};

export const FileUpload = (data: any) => {
  return instance.post<any, any>(`api/thirdparty/file/upload/image`, data, {
    headers: {
      "Content-Type":
        "multipart/form-data; boundary=----WebKitFormBoundarygPP2rqODACTHb1pv",
    },
  });
};

export const getFileInfo = (data: string) => {
  return instance.get<string, any>(
    `api/thirdparty/file/download/address/${data}`
  );
};

export const getFileUrlInfo = (data: string) => {
  return instance.get<
    string,
    APIResponse<{
      url: string;
      expiredTimeUtc: string;
    }>
  >(`api/thirdparty/file/download/url/${data}`, { debounce: false });
};

export const getTimeZoneByLocation = (params: {
  location: string;
  key: string;
  timestamp?: string;
}) => {
  return googleMapInstance.get<string, any>("", {
    params,
  });
};
