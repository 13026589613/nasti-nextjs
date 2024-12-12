import { shiftSwapResVO } from "@/api/shiftsThatNeedHelp/shiftSwaps/type";
import { ListParams } from "@/api/types";
export interface NeedHelpShift {
  id: string;
  departmentId: string;
  departmentName: string;
  employee: string;
  employeeId: string;
  employeeList: {
    id: string;
    userId: string;
    employee: string;
    phone: string;
    location: string;
    note: string;
    shiftDateTime: string;
    status: boolean;
  }[];
  roleId: string;
  roleName: string;
  locationId: string;
  locationName: string;
  proposer: string;
  proposerId: string;
  proposee: string[];
  status: NeedHelpShiftStatusVo; // "PENDING" | "APPROVED" | "REJECTED"
  partialShift: string; // "Yes"|"No"
  shiftId?: string;
  shiftDate: string;
  shiftEndTime: string;
  shiftStartTime: string;
  coverageStartTime?: string;
  coverageEndTime?: string;
  claimedBy: string;
  claimUserId?: string;
  phone: string;
  nationalPhone?: string;
  note: string;
  reason: string;
  comment: string;
  scheduleWeek: string;
  scheduleStartDate?: string;
  scheduleEndDate?: string;
  tags?: number[] | null;
}

export type NeedHelpShiftStatusVo =
  | "NEW"
  | "PENDING_APPROVAL"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "APPROVE"
  | "REJECT"
  | "REQUESTED";

export type TimeOffStatus = "APPROVED" | "REJECTED" | "PENDING";

export type SwapsData = {
  id: string;
  employee: string;
  userId: string;
  phone: string;
  shiftDateTime?: string;
  shiftDate?: string;
  shiftEndTime?: string;
  shiftStartTime?: string;
  location: string;
  note: string;
  tags: number[] | null;
};

export interface CallOffActionReq {
  actionType: number;
  shiftId: string;
  targetUserId?: string;
  sourceUserId?: string;
  id: string;
  reviewComment: string;
}

export interface CallOffOrUFGAo {
  id?: string;
  weekDate?: string;
  workerRoleId?: string;
  userId?: string;
  status?: string;
  type?: number;
  communityId?: string;
  departmentIds?: string[];
}

export interface CallOffOrUFGRes extends NeedHelpShift {
  shiftId: string;
  startTime: string;
  endTime: string;
  startTimeLocal: string;
  endTimeLocal: string;

  departmentId: string;
  departmentName: string;
  locationNames: string;

  note: string;
  reason: string;
  phone: string;

  userId: string;
  username: string;

  workerRoleId: string;
  workerRoleName: string;

  isPartial: boolean;
  type: number;
  weekDate: string;

  reviewAt: string;
  reviewBy: string;
  reviewComment: string;

  createdAt: string;
  createBy: string;
  updatedAt: string;
  updateBy: string;
}

export interface OpenShiftClaimsParams extends ListParams {
  communityId: string;
  departmentIds?: string | null;
  userId?: string | null;
  workerRoleId?: string | null;
  status?: string | null;
}

export interface OpenShiftClaimsVo extends NeedHelpShift {
  claimUserId: string;
  claimUsername: string;
  departmentId: string;
  departmentName: string;
  endTimeLocal: string;
  id: string;
  locationNames: string;
  note: string;
  reviewStatus: NeedHelpShiftStatusVo;
  shiftId: string;
  shiftReviewId: string;
  startTimeLocal: string;
  endTimeUtc: string;
  startTimeUtc: string;
  status: NeedHelpShiftStatusVo;
  workerRoleName: string;
}

export interface ReviewShiftClaimRequestReq {
  id: string;
  comment: string;
  status: string;
}

export interface IsSomeOneClaimedOpenShiftRes {
  id: string;
  shiftId: string;
  claimUserId: string;
  status: string;
  reviewStatus: string;
  startTimeLocal: string;
  endTimeLocal: string;
  note: string;
  shiftReviewId: string;
  departmentId: string;
  departmentName: string;
  workerRoleName: string;
  claimUsername: string;
  locationNames: string;
}
export type needHelpTableDataList = shiftSwapResVO;

export interface ShiftUfgRequestListParams extends ListParams {
  communityId: string;
  departmentIds?: string | null;
  userId?: string | null;
  workerRoleId?: string | null;
  status?: string | null;
}

export interface UfgRequestVo {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isDeleted: boolean;
  id: string;
  shiftId: string;
  isPartial: boolean;
  shiftReviewId: string;
  coverageStartTime: string;
  coverageStartTimeUtc: string;
  coverageEndTime: string;
  coverageEndTimeUtc: string;
  startTimeLocal: string;
  startTimeUtc: string;
  endTimeLocal: string;
  endTimeUtc: string;
  status: string;
  actionType: number;
}

export interface UfgShiftClaim {
  id: string;
  requestId: string;
  claimedBy: string;
  username: string;
  status: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface ShiftUfgRequestListRes extends NeedHelpShift {
  shiftId: string;
  type: 0;
  reviewComment: string;
  reviewAt: string;
  reviewBy: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  reason: string;
  departmentId: string;
  departmentName: string;
  workerRoleName: string;
  username: string;
  phone: string;
  email: string;
  userId: string;
  note: string;
  startTimeLocal: string;
  endTimeLocal: string;
  locationNames: string;
  ufgRequest: UfgRequestVo;
  claimList: UfgShiftClaim[];
  workerRoleId: string;
}

export interface ReviewUfgShiftReq {
  id: string;
  actionType: number;
  reviewComment?: string;
  coverageStartTime?: string;
  coverageEndTime?: string;
  targetUserId?: string;
}

export interface GetShiftSwapsReq extends ListParams {
  departmentIds?: string | null;
  workerRoleIds?: string | null;
  userIds?: string | null;
  statuses?: string | null;
  communityId: string;
}

export interface TryCoverUfgShiftListReq {
  ufgRequestId: string;
}

export interface CandidateShifts {
  id: string;
  scheduleId: string;
  communityId: string;
  departmentId: string;
  departmentName: string;
  locationRefVOs: {
    id: string;
    locationName: string;
    locationId: string;
  }[];
  workerRoleId: string;
  workerRoleName: string;
  workerRoleColor: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  dayOfWeek: number;
  startTimeUTC: string;
  endTimeUTC: string;
  startTimeLocal: string;
  endTimeLocal: string;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftDate: string;
  durationMins: number;
  paidMins: number;
  status: string;
  note: string;
  breakRequiredMins: number;
  checkinTime: string;
  checkoutTime: string;
  checkinTimeLocal: string;
  checkoutTimeLocal: string;
  checkinLat: number;
  checkinLng: number;
  checkoutLat: number;
  checkoutLng: number;
  parentId: string;
  isPartialShift: boolean;
  isPublished: boolean;
  tags: number[];
  zoneId: string;
  attendeeStatus: string;
}

export interface TryCoverUfgShiftListRes {
  shiftUfgRequest: UfgRequestVo;
  candidateShifts: CandidateShifts[];
}

export interface TryCoverUfgShiftReq {
  communityId: string;
  ufgRequestId: string;
  shifts: {
    id: string;
    communityId: string;
    startTimeLocal: string;
    endTimeLocal: string;
  }[];
  reviewComment?: string;
}
