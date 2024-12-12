import {
  AddLocationParams,
  EditLocationParams,
  GetLocationParams,
  GetLocationResponse,
} from "@/app/(system)/(service)/community/create/location/types";
import instance from "@/utils/http";

import { APIResponse } from "../types";
import { LocationListSearchParams, LocationListSearchRes } from "./types";

// base module config
const baseModuleUrl = "/api/service/location";

/**
 * @description load location list data
 * @param param
 * @returns
 */
export const getLocation = (param: GetLocationParams) =>
  instance.get<GetLocationParams, APIResponse<GetLocationResponse>>(
    `${baseModuleUrl}/list/page/department`,
    {
      params: param,
    }
  );

/**
 * @description delete location by Id
 * @param param
 * @returns
 */
export const deleteLocation = (data: string) =>
  instance.post<GetLocationParams, APIResponse<GetLocationResponse>>(
    `${baseModuleUrl}/delete/${data}`
  );

/**
 * @description add new location info
 * @param param
 * @returns
 */
export const addLocation = (data: AddLocationParams) => {
  return instance.post<AddLocationParams, APIResponse<string>>(
    `${baseModuleUrl}/create`,
    data
  );
};

/**
 * @description edit location info
 * @param param
 * @returns
 */
export const editLocation = (data: EditLocationParams) => {
  return instance.post<EditLocationParams, APIResponse<string>>(
    `${baseModuleUrl}/edit`,
    data
  );
};

/**
 * @description enabledLocation location by Id
 * @param param
 * @returns
 */
export const enabledLocation = (data: string) =>
  instance.post<GetLocationParams, APIResponse<GetLocationResponse>>(
    `${baseModuleUrl}/update/status/${data}`
  );

export const locationListSearch = (params: LocationListSearchParams) =>
  instance.get<GetLocationParams, APIResponse<LocationListSearchRes[]>>(
    `${baseModuleUrl}/list/search`,
    {
      params,
    }
  );
