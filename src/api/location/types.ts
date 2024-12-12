export interface LocationListSearchParams {
  communityId: string;
  isEnabled: boolean;
  departmentIds?: string;
}

export interface LocationListSearchRes {
  communityId: string;
  description?: any;
  id: string;
  isEnabled: boolean;
  listDepartment?: any;
  name: string;
}
