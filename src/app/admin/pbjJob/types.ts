/**
 * @description PbjJob Type
 */
import { ListParams } from "@/api/types";

/**
 * @description View Type
 */
export type PbjJobVo = {
  id: string; // id
  code: string; // code
  name: string; // name
  isSystem: boolean; // isSystem
  companyId: string; // companyId
  categoryName?: string;
  categoryCode?: string;
  categoryId?: string;
  communityId: string; // communityId
  createdAt: string; // createdAt
  createdBy: string; // createdBy
  updatedAt: string; // updatedAt
  updatedBy: string; // updatedBy
  isDeleted: boolean; // isDeleted
};

/**
 * @description Operate Type
 */
export type PbjJob = Omit<
  PbjJobVo,
  "createAt" | "createBy" | "updateAt" | "updateBy" | "deleted"
>;

/**
 * @description List Params
 */
export type GetPbjJobParams = ListParams | Partial<PbjJob>;

/**
 * @description List Data
 */
export type GetPbjJobResponse = {
  size: number;
  records: PbjJobVo[];
  current: number;
  total: number;
  pages: number;
};

/**
 * @description Operate Add
 */
export type AddPbjJobParams = Omit<PbjJob, "id">;

/**
 * @description Operate Edit
 */
export type EditPbjJobParams = PbjJob;

/**
 * @description Search
 */
export type SearchParams = Partial<Omit<PbjJob, "id">>;
