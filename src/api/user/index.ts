import instance from "@/utils/http";

import { ScheduleShift } from "../currentSchedule/types";
import { TemplateShift } from "../scheduleTemplates/types";
import { APIResponse } from "../types";
import {
  GetSuperAdminCommunityListResponse,
  GetUserCommunityListResponse,
  GetUserCompanyListResponse,
  GetUserCompanyTreeResponse,
  GetUserDepartmentListResponse,
  GetUserWorkerInfoRes,
  GetUserWorkerListParams,
  GetUserWorkerListRecord,
  GetUserWorkerListRoleAllReq,
  UserChangePasswordReq,
  UserEditUserInfoReq,
} from "./types";

export const getUserWorkerList = (params: GetUserWorkerListParams) =>
  instance.get<string, APIResponse<GetUserWorkerListRecord[]>>(
    `/api/service/userWorker/list`,
    {
      params,
    }
  );
export const getUserWorkerListRoleAll = (params: {
  departmentIds?: string;
  communityId: string;
  intersection?: boolean;
  roleId?: string;
}) =>
  instance.get<string, APIResponse<GetUserWorkerListRoleAllReq[]>>(
    `/api/service/userWorker/list/roleAll`,
    {
      params,
    }
  );

export const getUserWorkerInfo = (userId: string, communityId: string) =>
  instance.get<string, APIResponse<GetUserWorkerInfoRes>>(
    `/api/service/userWorker/info/${userId}`,
    {
      params: {
        communityId,
      },
    }
  );

export const getUserCommunityList = (data: { companyId: string }) => {
  return instance.get<
    {
      companyId: string;
    },
    APIResponse<GetUserCommunityListResponse[]>
  >(`/api/service/global/common/community/list`, {
    params: data,
  });
};

export const getUserDepartmentList = (data: { communityId: string }) => {
  return instance.get<
    {
      communityId: string;
    },
    APIResponse<GetUserDepartmentListResponse[]>
  >(`/api/service/global/common/department/list`, {
    params: data,
    debounce: false,
  });
};

export const getUserCompanyList = () => {
  return instance.get<null, APIResponse<GetUserCompanyListResponse[]>>(
    `/api/service/global/common/company/list`
  );
};

export const setOperateCommunity = (communityId: string) => {
  return instance.post<string, APIResponse<any>>(
    `/api/system/user/switch/community/${communityId}`
  );
};

export const getUserCompanyTree = () => {
  return instance.get<null, APIResponse<GetUserCompanyTreeResponse[]>>(
    `/api/service/global/common/tree/list`
  );
};

export const userChangePassword = (data: UserChangePasswordReq) => {
  return instance.post<boolean, APIResponse<boolean>>(
    `/api/system/user/change/password`,
    data,
    {
      hideErrorMessage: true,
    }
  );
};

export const getSuperAdminCompantTree = () => {
  return instance.get<null, APIResponse<GetUserCompanyTreeResponse[]>>(
    `/api/service/global/admin/company/list`
  );
};

export const getSuperAdminCommunityList = (companyId?: string | null) => {
  return instance.get<null, APIResponse<GetSuperAdminCommunityListResponse[]>>(
    `/api/service/global/admin/community/list`,
    {
      params: {
        companyId,
      },
    }
  );
};

export const userEditUserInfo = (data: UserEditUserInfoReq) => {
  return instance.post<boolean, APIResponse<boolean>>(
    `/api/system/user/editUserInfo`,
    data
  );
};

/**
 * @description load schedule select user and status list
 * @param params
 * @returns
 */
export const getScheduleUserListWithStatus = (data: {
  scheduleId?: string | null;
  departmentId?: string;
  communityId: string;
  workerRoleIds?: string;
  searchUserQuery: {
    shiftId?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
    shiftDate?: string[] | null;
    chooseSelectShifts?: ScheduleShift[];
    intersection?: boolean;
    operateType: string;
  };
}) =>
  instance.post<string, APIResponse<GetUserWorkerListRoleAllReq[]>>(
    `/api/service/userWorker/list/schedule/loadScheduleUserListWithStatus`,
    data
  );

/**
 * @description load template select user and status list
 * @param params
 * @returns
 */
export const getTemplateUserListWithStatus = (data: {
  templateId?: string;
  departmentId?: string;
  communityId: string;
  workerRoleId?: string;
  searchUserQuery: {
    intersection?: boolean;
    operateType: string;
    chooseSelectShifts?: TemplateShift[];
    dayOfWeek?: string | null;
    shiftIds?: string;
    startTime?: string;
    endTime?: string;
  };
}) =>
  instance.post<string, APIResponse<GetUserWorkerListRoleAllReq[]>>(
    `/api/service/userWorker/list/template/loadTemplateUserListWithStatus`,
    data
  );
