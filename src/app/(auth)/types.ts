export type LoginParams = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  //  ADMIN SCHEDULER WORKER or SCHEDULER,WORKER
  role: string;
};

export type SendEmailForForgotPasswoedParams = {
  email: string;
  type: string;
  redirectUrl: string;
};

export type SendEmailForForgotPasswoedResponse = "true" | "false";

export type validateForgotPasswordEmailParams = {
  token: string;
};

export type validateForgotPasswordEmailResponse = "true" | "false";

export type ResetPasswoedParams = {
  tokenId: string;
  password: string;
};

export type ResetPasswoedResponse = "true" | "false";

export type SignUpParams = {
  tokenId: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  title: string;
  communityId?: string;
};

export type SignUpResponse = {
  token: string;
};

export type GetUserInfoApiResponse = {
  id: string;
  email: string;
  phone: string;
  isEnabled: boolean;
  firstName: string;
  lastName: string;
  middleName: string;
  portraitFileId: string;
  nationalPhone: string;
  operateCommunity: {
    id: string;
    name: string;
    companyId: string;
    isConfirmed: boolean;
    isEnabled: boolean;
    startOfWeek: string;
    zoneId: string;
    zoneShortName: string;
  };
  inactiveCommunity: {
    id: string;
    name: string;
    companyId: string;
    roleId: string;
    roleType: string;
    isApproved: boolean;
    isEnabled: boolean;
    isConfirmed: boolean;
  }[];
  communitList: {
    id: string;
    name: string;
    companyId: string;
    roleId: string;
    roleType: string;
    isApproved: boolean;
    isEnabled: boolean;
    isConfirmed: boolean;
  }[];
};
