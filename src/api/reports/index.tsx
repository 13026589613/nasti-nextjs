import instance from "@/utils/http";

import { APIResponse, ValidatePhoneNumberRes } from "../types";

export const getReportsUrl = () =>
  instance.get<null, APIResponse<string>>(
    `/api/thirdparty/quicksight/create/url`
  );

export const messageValidatePhoneNumber = (phoneNumber: string) =>
  instance.get<string, APIResponse<ValidatePhoneNumberRes>>(
    `/api/system/message/validate/phoneNumber/${phoneNumber}`
  );

export const messageValidatePhoneNumber4LineType = (phoneNumber: string) =>
  instance.get<string, APIResponse<ValidatePhoneNumberRes>>(
    `/api/system/message/validate/phoneNumber4LineType/${phoneNumber}`
  );
