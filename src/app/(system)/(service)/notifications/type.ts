export type cateTypeKeys =
  | "SIGN_UP"
  | "SCHEDULE"
  | "OVERTIME_SHIFT"
  | "EMPLOYEE_CLAIMED_SHIFT"
  | "SHIFT_SWAP"
  | "SHIFT_CALL_OFF"
  | "SHIFT_UFG"
  | "ATTENDANCE";

export interface notificationsListItemVO {
  userNotificationId: string;
  userId: string;
  notificationId: string;
  notificationType: cateTypeKeys | null;
  notificationTypeName: string;
  metadata: string;
  status: string;
  createdAtUtc: string;
  readAtUtc: string;
}

export interface paginationVO {
  paginationToken: string | null;
  count: number;
  pageSize: number;
}
export interface notificationsListVO extends paginationVO {
  items: Array<notificationsListItemVO>;
}

export interface notificationsCateTypesData {
  key: cateTypeKeys;
  description: string;
}

export interface notificationsCateTypesOptionData {
  value: cateTypeKeys;
  label: string;
}
