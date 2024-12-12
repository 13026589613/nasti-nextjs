import {
  GetUserInfoApiResponse,
  LoginParams,
  LoginResponse,
  ResetPasswoedParams,
  ResetPasswoedResponse,
  SendEmailForForgotPasswoedParams,
  SendEmailForForgotPasswoedResponse,
  SignUpParams,
  SignUpResponse,
  validateForgotPasswordEmailParams,
  validateForgotPasswordEmailResponse,
} from "@/app/(auth)/types";
import instance from "@/utils/http";

import { APIResponse } from "../types";
// http://192.168.1.212:8090/api/system/user/login?username=admin&password=Simple1234
const baseUrl = "/api/system";
export const loginApi = (data: LoginParams) =>
  instance.post<LoginParams, APIResponse<LoginResponse>>(
    // `${baseUrl}/user/login?email=${data.username}&password=${data.password}`
    `${baseUrl}/user/login`,
    {
      email: data.username,
      password: data.password,
    }
  );

export const sendEmailForForgotPasswoed = (
  data: SendEmailForForgotPasswoedParams
) => {
  return instance.post<
    SendEmailForForgotPasswoedParams,
    APIResponse<SendEmailForForgotPasswoedResponse>
  >(`${baseUrl}/pub/auth/send/mail`, data);
};

export const validateForgotPasswordEmail = (
  data: validateForgotPasswordEmailParams
) => {
  return instance.get<
    validateForgotPasswordEmailParams,
    APIResponse<validateForgotPasswordEmailResponse>
  >(`${baseUrl}/pub/auth/validate/mail/${data.token}`);
};

export const resetPasswoed = (data: ResetPasswoedParams) => {
  return instance.post<ResetPasswoedParams, APIResponse<ResetPasswoedResponse>>(
    `${baseUrl}/pub/auth/reset/password`,
    data
  );
};
export const resetPasswoedVerify = (data: {
  email?: string;
  phone?: string;
}) => {
  return instance.post<
    {
      email?: string;
      phone?: string;
    },
    APIResponse<ResetPasswoedResponse>
  >(`${baseUrl}/pub/auth/reset/password/check`, data);
};

export const signUpApi = (data: SignUpParams) => {
  return instance.post<SignUpParams, APIResponse<SignUpResponse>>(
    `${baseUrl}/pub/auth/signUp`,
    data
  );
};

export const signOutApi = () => {
  return instance.post<SignUpParams, APIResponse<any>>(
    `${baseUrl}/user/logout`
  );
};

export const getUserInfoApi = (accessToken?: string) => {
  if (accessToken) {
    return instance.get<SignUpParams, APIResponse<GetUserInfoApiResponse>>(
      `${baseUrl}/user/info`,
      {
        headers: {
          Authorization: accessToken,
        },
      }
    );
  } else {
    return instance.get<SignUpParams, APIResponse<GetUserInfoApiResponse>>(
      `${baseUrl}/user/info`
    );
  }
};

export const signUpInviteApi = (data: SignUpParams) => {
  return instance.post<SignUpParams, APIResponse<SignUpResponse>>(
    `${baseUrl}/pub/auth/signUp/invite`,
    data
  );
};

export const inviteConfirmApi = (tokenId: string) => {
  return instance.post<string, APIResponse<string>>(
    `${baseUrl}/pub/auth/signUp/invite/confirm/${tokenId}`
  );
};

export const joinCommunityApi = (data: SignUpParams) => {
  return instance.post<unknown, APIResponse<string>>(
    `/api/system/user/apply/joinCommunity`,
    data
  );
};

export const InviteConfirmApi = (tokenId: string) => {
  return instance.post<boolean, APIResponse<boolean>>(
    `/api/system/pub/app/auth/invite/confirm/${tokenId}`
  );
};
