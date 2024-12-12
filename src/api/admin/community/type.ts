export type ListParams = {
  orderBy?: string;
  pageSize?: number;
  pageNum?: number;
};

export interface CommunitySearchParams extends ListParams {
  companyId?: string;
  name?: string;
  physicalAddress?: string;
  physicalCity?: string;
  physicalState?: string;
  physicalStateName?: string;
  isEnabled?: boolean | string | null;
}

export interface CommunityResponse {
  size: number;
  records: CommunityVo[];
  current: number;
  total: number;
  pages: number;
}

export interface CommunityVo {
  id: string;
  companyId: string;
  name: string;
  // "Enum: Sunday, Monday, Saturday": string;
  physicalAddress: string;
  physicalCity: string;
  physicalState: string;
  physicalStateName: string;
  physicalZip: string;
  mailingAddress: string;
  mailingAddress2: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  billingContact: string;
  billingEmail: string;
  attendanceEnabled: boolean;
  // "File id for community logo picture": string;
  locationLat: number;
  locationLng: number;
  isConfirmed: boolean;
  isEnabled: boolean;
  timeZoneId: string;
  buildingTypeList: string[];
  timeZoneReadOnly: boolean;
  startDayReadOnly: boolean;
  type?: string;
  startOfWeek?: string;
  logoFileId?: string;
}

export type CompanyVo = {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isDeleted: boolean;
  id: string;
  name: string;
  isActive: boolean;
  type?: string;
};

export type CompanyResponse = {
  size: number;
  records: CompanyVo[];
  current: number;
  total: number;
  pages: number;
};
