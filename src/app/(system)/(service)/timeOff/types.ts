import { ListParams } from "@/api/types";

export interface Department {
  id: string;
  communityId: string;
  name: string;
  description: string;
  userCommunityRefId: string;
}

export interface WorkerRole {
  id: string;
  communityId: string;
  code: string;
  name: string;
  color: string;
  userCommunityRefId: string;
  departmentId: string;
  departmentName: string;
  description: string;
}

export interface TimeOffVo {
  id: string;
  userCommunityRefId: string;
  communityId: string;
  communityName: string;
  reason: string;
  startTime: string;
  endTime: string;
  status: string;
  comment: string;
  reviewName: string;
  reviewTime: string;
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  startDate: string;
  endDate: string;
  startDateTime: string;
  endDateTime: string;
  endTimeUtc: string;
  startTimeUtc: string;
  departments: Department[];
  workerRoles: WorkerRole[];
}

export type TimeOffStatus = "APPROVED" | "REJECTED" | "PENDING";

export type GetTimeOffListParams = ListParams & {
  communityId: string;
  status: TimeOffStatus[];
  departmentIds: string[];
  startFromDate?: string | null;
  startToDate?: string | null;
  endFromDate?: string | null;
  endToDate?: string | null;
  workerRoleId?: string;
  workerId?: string;
  firstName?: string;
  lastName?: string;
};

export interface CheckTimeOffParams {
  timeOffId: string[];
  status: TimeOffStatus;
  comment?: string;
}
