import { ListParams } from "@/api/types";

export interface SearchParams {
  communityName?: string;
}

export type GetInviteListParams = ListParams | Partial<InviteVo>;

export interface GetInviteListResponse {
  size: number;
  current: number;
  records: InviteVo[];
  total: number;
  pages: number;
}
export interface InviteVo {
  id: string;
  email: string;
  type: string;
  expiryTime: string;
  userCommunityRefId: string;
  userName: string;
  communityName: string;
  createdAt: string;
  roleCode: string;
}
