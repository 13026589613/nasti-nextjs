/**
 * @description Community Type
 */
import { ListParams } from "@/api/types";

/**
 * @description View Type
 */
export type CommunityVo = {
  id: string | number;
  companyId: string;
  name: string;
  startOfWeek: string; // Enum: Sunday, Monday, Saturday
  physicalAddress: string;
  physicalCity: string;
  physicalState: string;
  physicalZip: string;
  mailingAddress: string;
  mailingAddress2: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  billingContact: string;
  billingEmail: string;
  attendanceEnabled: boolean;
  logoFileId: string; // File id for community logo picture
  locationLat: number;
  locationLng: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isDeleted: string;
  buildingTypeId?: Array<string>;
  buildingTypeList: Array<string>;
  timeZoneId: string;
  startDayReadOnly: boolean;
  timeZoneReadOnly: boolean;
};

/**
 * @description Regions list
 */

export type RegionsEntity = {
  id: string;
  name: string;
  shortName: string;
  type: number;
  parentId?: string;
};
export type CompanyEntity = {
  key: string;
  value: string;
};

export type CompanyResponse = Array<CompanyEntity>;

export type RegionsResponse = Array<Omit<RegionsEntity, "type" | "parentId">>;
/**
 * @description Operate Type
 */
export type Community = Omit<
  CommunityVo,
  "createAt" | "createBy" | "updateAt" | "updateBy" | "deleted"
>;

/**
 * @description List Params
 */
export type GetCommunityParams = ListParams & Partial<Community>;

/**
 * @description List Data
 */
export type GetCommunityResponse = {
  size: number;
  records: CommunityVo[];
  current: number;
  total: number;
  pages: number;
};

/**
 * @description Operate Add
 */
export type AddCommunityParams = Omit<Community, "id">;

/**
 * @description Operate Edit
 */
export type EditCommunityParams = Community;

/**
 * @description Search
 */
export type SearchBaseParams = Partial<Omit<Community, "id">>;
export interface SearchParams extends SearchBaseParams {
  physicalStateName: string;
}

/**
 * @description Regions param
 */
export type RegionsParam = { type: number; parentId?: string };

export type GetCommunityInfoResponse = CommunityVo;

export type AddCommunityInput = {
  companyId: string;
  newCompanyName: string;
  name: string;
  startOfWeek: string;
  physicalAddress: string;
  physicalCity: string;
  physicalState: string;
  physicalZip: string;
  mailingAddress: string;
  mailingAddress2: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  billingContact: string;
  billingEmail: string;
  attendanceEnabled: boolean;
  logoFileId?: string;
  locationLat: number;
  locationLng: number;
  // buildingTypeId: Array<string>;
  buildingTypeList: Array<string>;
  timeZoneId: string;
  addType: "ON_BOARDING" | "CREATE"; //from onboarding or create page
};

export interface EditCommunityInput extends AddCommunityInput {
  id: string;
}

export type GetTimeZoneResponse = {
  key: string;
  value: string;
}[];

export type GetCommunityIsConfirmResponse = {
  departmentData: boolean;
  rolesData: boolean;
  scheduleRulesData: boolean;
};
