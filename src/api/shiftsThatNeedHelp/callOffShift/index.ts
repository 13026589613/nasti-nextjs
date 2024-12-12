import { ListParams } from "@/api/types";
import {
  CallOffActionReq,
  CallOffOrUFGAo,
  CallOffOrUFGRes,
  IsSomeOneClaimedOpenShiftRes,
  OpenShiftClaimsParams,
  OpenShiftClaimsVo,
  ReviewShiftClaimRequestReq,
  ReviewUfgShiftReq,
  ShiftUfgRequestListParams,
  ShiftUfgRequestListRes,
  TryCoverUfgShiftListReq,
  TryCoverUfgShiftListRes,
  TryCoverUfgShiftReq,
} from "@/app/(system)/(service)/shiftsNeedHelp/types";
import instance from "@/utils/http";

import { APIResponse, ListResponse } from "../../types";

export const loadCallOffShiftList = (data: ListParams & CallOffOrUFGAo) =>
  instance.get<string, APIResponse<ListResponse<CallOffOrUFGRes>>>(
    `/api/service/shift/callOff/list/page`,
    { params: data }
  );

export const approvalCallOffShift = (data: CallOffActionReq) => {
  return instance.post<string, APIResponse<boolean>>(
    `/api/service/shift/callOff/review`,
    data
  );
};

export const initCallOffShiftDetail = (shiftId: string) => {
  return instance.get<string, APIResponse<CallOffOrUFGRes>>(
    `/api/service/shift/callOff/info/${shiftId}`,
    {
      params: {
        shiftId: shiftId,
      },
    }
  );
};

export const openShiftClaims = (params: OpenShiftClaimsParams) => {
  return instance.get<
    OpenShiftClaimsParams,
    APIResponse<ListResponse<OpenShiftClaimsVo>>
  >(`/api/service/shiftClaimRequest/list/page`, {
    params: params,
  });
};

export const openShiftClaimsDetail = (id: string) => {
  return instance.get<string, APIResponse<OpenShiftClaimsVo>>(
    `/api/service/shiftClaimRequest/info/${id}`
  );
};

export const shiftClaimRequestList = (shiftId: string) => {
  return instance.get<OpenShiftClaimsParams, APIResponse<ListResponse<any>>>(
    `/api/service/shiftClaimRequest/exist/list`,
    {
      params: { shiftId },
    }
  );
};

export const reviewShiftClaimRequest = (data: ReviewShiftClaimRequestReq) => {
  return instance.post<ReviewShiftClaimRequestReq, APIResponse<boolean>>(
    `/api/service/shiftClaimRequest/review`,
    data
  );
};

export const isSomeOneClaimedOpenShift = (shiftId: string) => {
  return instance.get<string, APIResponse<IsSomeOneClaimedOpenShiftRes[]>>(
    `/api/service/shiftClaimRequest/exist/list`,
    {
      params: { shiftId },
    }
  );
};

export const shiftUfgRequestList = (params: ShiftUfgRequestListParams) => {
  return instance.get<
    string,
    APIResponse<ListResponse<ShiftUfgRequestListRes>>
  >(`/api/service/shift/ufg/list/page`, {
    params,
  });
};

export const ufgShiftDetail = (shiftId: string) => {
  return instance.get<string, APIResponse<ShiftUfgRequestListRes>>(
    `/api/service/shift/ufg/info/${shiftId}`
  );
};

export const reviewUfgShift = (data: ReviewUfgShiftReq) => {
  return instance.post<ReviewUfgShiftReq, APIResponse<ShiftUfgRequestListRes>>(
    `/api/service/shift/ufg/review`,
    data
  );
};

export const tryCoverUfgShiftList = (data: TryCoverUfgShiftListReq) => {
  return instance.get<
    TryCoverUfgShiftListReq,
    APIResponse<TryCoverUfgShiftListRes>
  >(`/api/service/shift/ufg/tryCoverUfgShift`, {
    params: data,
  });
};

export const tryCoverUfgShift = (data: TryCoverUfgShiftReq) => {
  return instance.post<
    TryCoverUfgShiftReq,
    APIResponse<{
      isSuccess: boolean;
      errorMsg: string[];
    }>
  >(`/api/service/shift/ufg/tryCoverUfgShift`, data);
};
