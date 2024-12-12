export interface pageListParams {
  communityId: string;
  departmentIds: string;
  createTimeStartUtc: string | null;
  createTimeEndUtc: string | null;
  content: string;
  pageNum: number;
  pageSize: number;
}

export interface unreadPageListParams {
  communityId: string;
  userId: string;
  pagerAO?: {
    pageNum: number;
    pageSize: number;
    orderBy: string;
  };
}

export interface userInfoDataResVO {
  id: string;
  communityId: string;
  announcementId: string;
  userId: string;
  readAt: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Recipients {
  userId: string;
  firstName: string;
  lastName: string;
  readAt: string;
}

export interface pageListResVO {
  id: string;
  communityId: string;
  departmentIds: string;
  roleIds: string;
  permissionCodes: string;
  expirationDateTime: string;
  expirationDateTimeLocal: string;
  content: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isDeleted: boolean;
  departmentNames: string;
}

export interface AnnouncementInfoData {
  id: string;
  communityId: string;
  departmentIds: string;
  roleIds: string;
  permissionCodes: string;
  expirationDateTime: string;
  expirationDateTimeLocal: string;
  content: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isDeleted: boolean;
  departmentNames: string;
  permissionNames: string;
  roleNames: string;
  recipients: Recipients[];
}

export interface createParams {
  communityId: string;
  departmentIds: string[];
  roleIds: string[];
  permissionCodes: string[];
  expirationDateLocal: string;
  content: string;
}
