/**
 * @description Company Type
 */
import { ListParams } from "@/api/types";

/**
 * @description View Type
 */
export type CompanyVo = {
  id: string; // id
  name: string; // name
  createdAt: string; // createdAt
  createdBy: string; // createdBy
  updatedAt: string; // updatedAt
  updatedBy: string; // updatedBy
  isDeleted: boolean; // isDeleted
};

/**
 * @description Operate Type
 */
export type Company = Omit<
  CompanyVo,
  "createAt" | "createBy" | "updateAt" | "updateBy" | "deleted"
>;

/**
 * @description List Params
 */
export type GetCompanyParams = ListParams | Partial<Company>;

/**
 * @description List Data
 */
export type GetCompanyResponse = {
  size: number;
  records: CompanyVo[];
  current: number;
  total: number;
  pages: number;
};

/**
 * @description Operate Add
 */
export type AddCompanyParams = Omit<Company, "id">;

/**
 * @description Operate Edit
 */
export type EditCompanyParams = Company;

/**
 * @description Search
 */
export type SearchParams = Partial<Omit<Company, "id">>;
