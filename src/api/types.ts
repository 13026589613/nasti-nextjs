export type APIResponse<T = any> = {
  map(arg0: (item: any) => { label: any; value: any }): unknown;
  code: number;
  message: string;
  data: T;
};

export type ListParams = {
  orderBy?: string;
  pageSize: number;
  pageNum: number;
};

export type OrderByType = {
  key: string;
  order: "asc" | "desc";
}[];

export type PaginationType = {
  pageNum: number;
  pageSize: number;
  total: number;
};

export type ListResponse<T> = {
  size: number;
  total: number;
  pages: number;
  current: number;
  records: T[];
};

export type EmployeesTableList = {
  id: string;
  shiftDate?: string;
  shiftTime?: string;
  role?: string;
  checkInTime?: string;
  checkOutTime?: string;
  startDateTime?: string;
  endDateTime?: string;
  reason?: string;
  exception?: string;
  status?: number | string;
  arb?: string;
  arbdt?: string;
}[];

export interface ValidatePhoneNumberRes {
  valid: boolean;
  url: string;
  callingCountryCode?: any;
  phoneNumber: PhoneNumber;
  nationalFormat: string;
  validationErrors: string[];
  callerName?: any;
  simSwap?: any;
  callForwarding?: any;
  lineStatus?: any;
  lineTypeIntelligence?: {
    carrier_name?: string;
    error_code?: any;
    mobile_country_code?: string;
    mobile_network_code?: any;
    type?: string;
  };
  identityMatch?: any;
  reassignedNumber?: any;
  smsPumpingRisk?: any;
  phoneNumberQualityScore?: any;
  preFill?: any;
}
export interface PhoneNumber {
  endpoint: string;
}
