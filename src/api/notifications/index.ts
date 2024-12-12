import {
  cateTypeKeys,
  notificationsCateTypesData,
  notificationsListItemVO,
  notificationsListVO,
} from "@/app/(system)/(service)/notifications/type";
import instance from "@/utils/http";

import { APIResponse } from "../types";

// base module config
const baseModuleUrl = "/api/notify";

export const notificationsList = (params: {
  userId: string;
  pageSize?: number;
  paginationToken?: string | null;
  communityId: string;
  notificationType?: cateTypeKeys | null;
  notifyStartDate?: string | null;
  notifyEndDate?: string | null;
}) => {
  return instance.get<string, APIResponse<notificationsListVO>>(
    `${baseModuleUrl}/notification/list/page`,
    { params }
  );
};

export const notificationsInfo = (id: string) => {
  return instance.get<string, APIResponse<notificationsListItemVO>>(
    `${baseModuleUrl}/notification/info/${id}`
  );
};

export const readNotification = (data: string[]) => {
  return instance.post<string, APIResponse<any>>(
    `${baseModuleUrl}/notification/read`,
    data
  );
};

export const notificationsCateTypes = () => {
  return instance.get<string, APIResponse<notificationsCateTypesData[]>>(
    `${baseModuleUrl}/notification/notificationTypes`
  );
};

export const notificationsUnreadCount = (params: {
  communityId: string;
  userId: string;
}) => {
  return instance.get<string, APIResponse<number>>(
    `${baseModuleUrl}/notification/unreadCount`,
    {
      params,
    }
  );
};
