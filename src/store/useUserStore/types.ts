export type UserInfoType = Partial<{
  id: string;
  email: string;
  phone: string;
  isEnabled: boolean;
  firstName: string;
  lastName: string;
  middleName: string;
  portraitFileId: string;
  nationalPhone: string;
}>;
type CommunityInfo = Partial<{
  id: string;
  name: string;
  companyId: string;
  isConfirmed: boolean;
  isEnabled: boolean;
  isApproved: boolean;
  roleId: string;
  roleType: string;
  timeZoneId: string;
  startOfWeek: string;
  zoneId: string;
  attendanceEnabled: boolean;
  userCommunityRefId: string;
}>;
export type OperateCommunity = Omit<CommunityInfo, "roleId" | "roleType">;

export type InactiveCommunity = CommunityInfo[];

export type CommunityList = CommunityInfo[];
