import { SignUpParams } from "../types";

export interface PasswordData {
  confirmPassword: string;
  password: string;
}

export interface RegisterInfoLessData
  extends Omit<SignUpParams, "tokenId" | "password"> {
  companyId: string;
}

export interface RegisterInfoData extends RegisterInfoLessData {
  communityName?: string;
  communityAddress?: string;
  communityCity?: string;
  communityState?: string;
  communityZip?: string;
  companyName?: string;
}
