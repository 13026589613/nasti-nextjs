import {
  AddTypeDictinaryParams,
  EditTypeDictinaryParams,
  GetTypeDictinaryParams,
  GetTypeDictinaryResponse,
} from "@/app/(system)/(admin)/dictionary/type";
import instance from "@/utils/http";

import { APIResponse } from "../types";

export const getTypeDictinary = (param: GetTypeDictinaryParams) =>
  instance.get<GetTypeDictinaryParams, APIResponse<GetTypeDictinaryResponse>>(
    "/api/system/dictType/list/page",
    {
      params: param,
    }
  );

export const deleteTypeDictinary = (data: string) =>
  instance.post<GetTypeDictinaryParams, APIResponse<GetTypeDictinaryResponse>>(
    `/api/system/dictType/delete/${data}`
  );

export const addTypeDictinary = (data: AddTypeDictinaryParams) => {
  return instance.post<AddTypeDictinaryParams, APIResponse<string>>(
    "/api/system/dictType/create",
    data
  );
};

export const editTypeDictinary = (data: EditTypeDictinaryParams) => {
  return instance.post<EditTypeDictinaryParams, APIResponse<string>>(
    "/api/system/dictType/edit",
    data
  );
};
