export type ListParams = {
  orderBy?: string;
  pageSize: number;
  pageNum: number;
};

export interface UserParams extends ListParams {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  isEnabled?: string | boolean;
  redirectUrl: string;
}

export type UserVo = {
  id: string;
  email: string;
  phone?: any;
  nationalPhone?: any;
  firstName?: string;
  lastName?: string;
  isEnabled: boolean;
  userCommunityRefId: string;
  status: number;
};

export type UserListResponse = {
  size: number;
  records: UserVo[];
  current: number;
  total: number;
  pages: number;
};

export interface InvitationResponse {
  userCommunityRefIds: string[];
  redirectUrl: string;
}

export interface SearchParams {
  condition?: string;
}
