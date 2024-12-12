export type CommunityRuleCodeListResponse = {
  code: string;
  default: boolean;
  name: string;
}[];

export type CreateCommunityRuleInfoInput = {
  communityId: string;
  overtimeRule: string;
  overtimeMessageHrs?: string | null;
  overtimeEmployeeHrs?: string;
  overtimeCommunityHrs?: string;
  openShiftRule: string;
  partialShiftMinHrs?: string;
  partialShiftRule: string;
  partialShiftAutoApprove?: boolean;
  partialShiftRemainingMinHrs?: string;
  swapRule: string;
  ufgRule: string;
  calloffRule: string;
  calloffAllowHrs?: string;
  checkinMaxMins: number;
  checkinExceptionMaxMins: number;
  checkoutExceptionAfterMins: number;
  checkoutExceptionBeforeMins: number;
  isBreakTimeEnabled: boolean;
  defaultBreakTimeMins: number;
  maxMealBreakTimeMins: number;
  locationLat?: number;
  locationLng?: number;
  openShiftClaimMins: number;
  swapAllowHrs: number | null;
  ufgAllowHrs: number | null;
  sendToKareRule: string;
  sendToKareStartDay?: number | null;
  sendKareManuallyNotification?: boolean | null;
  sendKareManuallyNotificationDay?: number | null;
  attendanceLocationAOS: AttendanceLocationAOS[] | null;
};

export type CreateCommunityRuleInfoResponse = any;

export interface EditCommunityRuleInfoInput
  extends CreateCommunityRuleInfoInput {
  id: string;
}

export type AttendanceLocationAOS = {
  type: "CHECK_IN" | "CHECK_OUT";
  coordinates: number[][];
};

export type GetCommunityRuleInfoResponse = {
  id?: string;
  communityId: string;
  overtimeRule: string;
  overtimeMessageHrs: string;
  overtimeEmployeeHrs: string;
  overtimeCommunityHrs: string;
  openShiftRule: string;
  openShiftClaimMins: string;
  partialShiftMinHrs: string;
  partialShiftRule: string;
  partialShiftAutoApprove: boolean;
  partialShiftRemainingMinHrs: string;
  swapRule: string;
  ufgRule: string;
  calloffRule: string;
  calloffAllowHrs: string;
  checkinMaxMins: number;
  checkinExceptionMaxMins: number;
  checkoutExceptionAfterMins: number;
  checkoutExceptionBeforeMins: number;
  isBreakTimeEnabled: boolean;
  defaultBreakTimeMins: number;
  maxMealBreakTimeMins: number;
  locationLat: number;
  locationLng: number;
  swapAllowHrs: string;
  ufgAllowHrs: string;
  sendToKareRule: string;
  sendToKareStartDay: string;
  sendKareManuallyNotification: boolean;
  sendKareManuallyNotificationDay: string;
  attendanceLocationAOS: AttendanceLocationAOS[];
};
