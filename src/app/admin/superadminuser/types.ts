/**
 * @description UserCommunityRef Type
 */
import { ListParams } from "@/api/types";

export type DepartmentListVos = {
  id: string;
  name: string;
};

export type CommunityInner = {
  id: string;
  communityName: string;
};

/**
 * @description View Type
 */
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

/**
 * @description List Params
 */
export type GetUserParams = ListParams & {
  id: string;
  email: string;
  phone?: string;
  nationalPhone?: string;
  password?: string;
  firstName: string;
  lastName: string;
  isEnabled?: string;
};

/**
 * @description Operate Type
 */
export type User = Omit<
  UserVo,
  "createAt" | "createBy" | "updateAt" | "updateBy" | "deleted"
>;

/**
 * @description Search
 */
export type SearchParams = Partial<Omit<User, "id">>;
