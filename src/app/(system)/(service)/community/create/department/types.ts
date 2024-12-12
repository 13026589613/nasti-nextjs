/**
 * @description Department Type
 */
import { ListParams } from "@/api/types";

/**
 * @description View Type
 */
export type DepartmentVo = {
  // [x: string]: SetStateAction<never[]>;
  id: string; //
  communityId: string; //
  name: string; //
  description: string; //
  createdAt: string; //
  createdBy: string; //
  updatedAt: string; //
  updatedBy: string; //
  locationList: Array<{
    locationId: string;
    locationName: string;
  }>;
  isDeleted: string; //
  status: boolean;
  isHppd: boolean;
  isReportPbjHour: boolean;
  newIsHppd: string;
  newIsReportPbjHour: string;
  isReportPbjHourDes?: string;
  isHppdDes?: string;
  isEnabled?: boolean;
  locationRefs: Array<{
    locationId?: string;
    name?: string;
  }>;

  newIsTrackCensus: string;
  isTrackCensus?: boolean;
};

/**
 * @description Operate Type
 */
export type Department = Omit<
  DepartmentVo,
  "createAt" | "createBy" | "updateAt" | "updateBy" | "deleted"
>;

/**
 * @description List Params
 */
export type GetDepartmentParams = ListParams &
  Partial<Department> & { communityId: string };

/**
 * @description List Data
 */
export type GetDepartmentResponse = {
  size: number;
  records: DepartmentVo[];
  current: number;
  total: number;
  pages: number;
};

/**
 * @description Operate Add
 */
export type AddDepartmentParams = Omit<Department, "id">;

/**
 * @description Operate Edit
 */
export type EditDepartmentParams = Partial<Department>;

/**
 * @description Search
 */
export type SearchParams = Partial<Omit<Department, "id">>;

export type DepartmentEmployeeParams = {
  communityId?: string;
  username?: string;
};
