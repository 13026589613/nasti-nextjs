import { create } from "zustand";

interface UseNotificationStoreType {
  unreadNum: number;
  setUnreadNum: (num: number) => void;
  isRefreshUnreadMessageNumber: boolean;
  setIsRefreshUnreadMessageNumber: (isRefresh: boolean) => void;
  readNotificationIds: string[];
  readNotification: (ids: string[]) => void;
  isRefreshNotificationList: boolean;
  setIsRefreshNotificationList: (isRefresh: boolean) => void;
}

const useNotificationStore = create<UseNotificationStoreType>((set, get) => ({
  unreadNum: 0,
  setUnreadNum: (num) => set({ unreadNum: num }),
  isRefreshUnreadMessageNumber: false,
  setIsRefreshUnreadMessageNumber: (isRefresh) =>
    set({ isRefreshUnreadMessageNumber: isRefresh }),
  readNotificationIds: [],
  readNotification: (ids) => set({ readNotificationIds: ids }),
  isRefreshNotificationList: false,
  setIsRefreshNotificationList: (isRefresh) =>
    set({ isRefreshNotificationList: isRefresh }),
}));

export default useNotificationStore;
