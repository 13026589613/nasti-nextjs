import { EXCEPTION_REASON } from "@/constant/statusConstants";

export type ExceptionReason = keyof typeof EXCEPTION_REASON;

export type ExceptionsVo = {
  id: string;
  departmentId: string;
  departmentName: string;
  workerRoleName: string;
  username: string;
  userId: string;
  startTimeLocal: string;
  endTimeLocal: string;
  checkInTimeLocal: string;
  checkOutTimeLocal: string;
  status: ExceptionReason;
  shiftId: string;
  location: {
    lat: number;
    lng: number;
  };
  attendeeType: "CHECK_IN" | "CHECK_OUT";
};

export interface ExceptionsDetail extends ExceptionsVo {
  note: string;
  phone: string;
  nationalPhone: string;
  locationId: string;
  locationName: string;
  reason?: string;
  communityId: string;
  checkInUtc: string;
  checkOutUtc: string;
  startTimeUtc?: string;
  endTimeUtc?: string;
  shiftReviewId: string;
}

export interface TimeAndAttendanceListApiParamsVO {
  communityId: string;
  departmentIds: string;
  userId: string;
  workerRoleId: string;
  checkType: string;
  status: string;
  pageNum: number;
  pageSize: number;
}

export interface TimeAndAttendanceReviewApiDataVO {
  id: string;
  shiftId: string;
  communityId: string;
  attendeeTime: string;
  attendeeType: "CHECK_IN" | "CHECK_OUT";
  comment: string;
  reviewType: string;
}

export interface TimeAndAttendanceListApiResVO {
  attendeeTime: string;
  attendeeType: "CHECK_IN" | "CHECK_OUT";
  attendeeUserId: string;
  attendeeUsername: string;
  checkInUtc: string;
  checkOutUtc: string;
  checkinLat: number;
  checkinLng: number;
  checkoutLat: number;
  checkoutLng: number;
  communityId: string;
  departmentId: string;
  departmentName: string;
  endTimeUtc: string;
  id: string;
  locationNames: string;
  phone: string;
  nationalPhone: string;
  reviewStatus: string;
  shiftId: string;
  shiftReviewId: string;
  startTimeUtc: string;
  status: ExceptionReason;
  workerRoleName: string;
  note: string;
}

export type CheckType = "checkin" | "checkout";
