import instance from "@/utils/http";

import { APIResponse, ListResponse, PaginationType } from "../types";
import {
  AnnouncementInfoData,
  createParams,
  pageListParams,
  pageListResVO,
  Recipients,
  unreadPageListParams,
  userInfoDataResVO,
} from "./type";

const baseModuleUrl = "/api/service";

export const pageList = (params: pageListParams) => {
  return instance.get<string, APIResponse<ListResponse<pageListResVO>>>(
    `${baseModuleUrl}/announcement/list/page`,
    { params }
  );
};

export const infoData = (id: string) => {
  return instance.get<string, APIResponse<AnnouncementInfoData>>(
    `${baseModuleUrl}/announcement/info/${id}`
  );
};

export const recipientsList = (id: string, params: PaginationType) => {
  return instance.get<string, APIResponse<ListResponse<Recipients>>>(
    `${baseModuleUrl}/announcement/info/${id}/recipients`,
    {
      params,
    }
  );
};

export const userInfoData = (userAnnouncementId: string) => {
  return instance.get<string, APIResponse<userInfoDataResVO>>(
    `${baseModuleUrl}/announcement/userAnnouncementInfo/${userAnnouncementId}`
  );
};

export const unreadPageList = (params: unreadPageListParams) => {
  return instance.get<string, APIResponse<ListResponse<userInfoDataResVO>>>(
    `${baseModuleUrl}/announcement/userUnReadList/page`,
    { params }
  );
};

export const readAnnouncement = (announcementId: string) => {
  return instance.post<string, APIResponse>(
    `${baseModuleUrl}/announcement/read/${announcementId}`
  );
};

export const createAnnouncement = (data: createParams) => {
  return instance.post<string, APIResponse>(
    `${baseModuleUrl}/announcement/create`,
    data
  );
};

export const deleteAnnouncement = (id: string) => {
  return instance.post<string, APIResponse>(
    `${baseModuleUrl}/announcement/delete/${id}`
  );
};
