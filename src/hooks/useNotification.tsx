import { useShallow } from "zustand/react/shallow";

import useNotificationStore from "@/store/useNotificationStore";

const useNotification = () => {
  const {
    unreadNum,
    isRefreshUnreadMessageNumber,
    readNotificationIds,
    isRefreshNotificationList,
    setIsRefreshNotificationList,
    readNotification,
    setUnreadNum,
    setIsRefreshUnreadMessageNumber,
  } = useNotificationStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  return {
    unreadNum,
    isRefreshUnreadMessageNumber,
    readNotificationIds,
    isRefreshNotificationList,
    setIsRefreshNotificationList,
    readNotification,
    setUnreadNum,
    setIsRefreshUnreadMessageNumber,
  };
};

export default useNotification;
