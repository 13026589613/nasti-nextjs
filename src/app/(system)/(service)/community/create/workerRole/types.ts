/**
 * @description WorkerRole Type
 */
import { ListParams } from "@/api/types";

/**
 * @description View Type
 */
export type WorkerRoleVo = {
  departmentWorkRoleVos: any;
  id: string; // id
  companyId: string; // companyId
  code: string; // code
  name: string; // name
  color: string; // color
  createdAt: string; // createdAt
  createdBy: string; // createdBy
  updatedAt: string; // updatedAt
  updatedBy: string; // updatedBy
  isDeleted: boolean; // isDeleted
  communityId: string;
  departmentLocationRefAOList: any;
  isHppd: string;
  isReportPbjHour: string;
  isEnabled: boolean;
};
export type WorkerRoleDept = Pick<WorkerRoleVo, "name" | "code" | "id"> & {
  hppdTargetHour: string;
  hppd: boolean;
};

/**
 * @description Operate Type
 */
export type WorkerRole = Omit<
  WorkerRoleVo,
  "createAt" | "createBy" | "updateAt" | "updateBy" | "deleted"
>;

/**
 * @description List Params
 */
export type GetWorkerRoleParams = ListParams | Partial<WorkerRole>;

/**
 * @description List Data
 */
export type GetWorkerRoleResponse = {
  size: number;
  records: WorkerRoleVo[];
  current: number;
  total: number;
  pages: number;
};

/**
 * @description Operate Add
 */
export type AddWorkerRoleParams = Omit<WorkerRole, "id">;

/**
 * @description Operate Edit
 */
export type EditWorkerRoleParams = WorkerRole;

/**
 * @description Search
 */
export type SearchParams = Partial<Omit<WorkerRole, "id">>;

export type RolesParams = {
  communityId?: string;
  username?: string;
};

export type GetRoleJobRes = {
  categoryCode: null | string;
  categoryId: string;
  categoryName: null | string;
  code: string;
  companyId: null | string;
  createdAt: string;
  createdBy: string;
  id: string;
  isDeleted: boolean;
  isSystem: boolean;
  name: string;
  updatedAt: string;
  updatedBy: string;
};
