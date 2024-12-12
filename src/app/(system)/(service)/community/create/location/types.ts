/**
 * @description Location Type
 */
import { ListParams } from "@/api/types";

/**
 * @description View Type
 */
export type LocationVo = {
  id: string; // id
  communityId: string; // communityId
  name: string; // name
  description: string; // description
  isEnabled: boolean; // isEnabled
  createdAt: string; // createdAt
  createdBy: string; // createdBy
  updatedAt: string; // updatedAt
  updatedBy: string; // updatedBy
  isDeleted: boolean; // isDeleted
};

/**
 * @description Operate Type
 */
export type Location = Omit<
  LocationVo,
  "createAt" | "createBy" | "updateAt" | "updateBy" | "deleted"
>;

/**
 * @description List Params
 */
export type GetLocationParams = ListParams & Partial<Location>;

/**
 * @description List Data
 */
export type GetLocationResponse = {
  records: LocationVo[];
  total: number;
};

/**
 * @description Operate Add
 */
export type AddLocationParams = Omit<Location, "id">;

/**
 * @description Operate Edit
 */
export type EditLocationParams = Location;

/**
 * @description Search
 */
export type SearchParams = Partial<Omit<Location, "id">>;
