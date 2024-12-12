import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  readAnnouncement,
  unreadPageList,
  userInfoData,
} from "@/api/announcements";
import { userInfoDataResVO } from "@/api/announcements/type";
import { notificationsUnreadCount } from "@/api/notifications";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useNotification from "@/hooks/useNotification";
import useUserStore from "@/store/useUserStore";

interface AnnouncementInfo {
  open: boolean;
  data?: userInfoDataResVO | null;
}

interface compProps {
  setAnnouncementInfo: (info: AnnouncementInfo) => void;
}
const useNavAnnouncement = (props: compProps) => {
  const { setAnnouncementInfo } = props;

  const { userInfo } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const {
    isRefreshUnreadMessageNumber,
    unreadNum,
    setIsRefreshUnreadMessageNumber,
    setUnreadNum,
  } = useNotification();

  const [announcementList, setAnnouncementList] = useState<userInfoDataResVO[]>(
    []
  );

  const { communityId } = useGlobalCommunityId();

  const handleShowAnnouncementDetail = async (id: string) => {
    try {
      const { code, data } = await userInfoData(id);
      if (code !== 200) return;

      setAnnouncementInfo({
        open: true,
        data,
      });
    } catch (error) {}
  };

  const handleCloseAnnouncement = async (id: string) => {
    try {
      const { code, data } = await readAnnouncement(id);
      if (code !== 200 || !data) return;
      getUnreadAnnouncementPageList();
    } catch (error) {}
  };

  const getUnreadAnnouncementPageList = async () => {
    try {
      const { data, code } = await unreadPageList({
        communityId,
        userId: userInfo.id || "",
      });
      if (code !== 200) return;
      setAnnouncementList(data.records);
    } catch (error) {}
  };

  const unreadNumRef = useRef<number | null>(null);

  useEffect(() => {
    unreadNumRef.current = unreadNum;
  }, [unreadNum]);

  const getNotificationsUnreadCount = async () => {
    try {
      const { data: unreadCount, code } = await notificationsUnreadCount({
        communityId,
        userId: userInfo.id || "",
      });
      if (code !== 200) return;
      setUnreadNum(unreadCount ? unreadCount : 0);
    } catch (error) {}
  };

  useEffect(() => {
    getNotificationsUnreadCount();
    getUnreadAnnouncementPageList();
  }, []);

  useEffect(() => {
    if (isRefreshUnreadMessageNumber) {
      getNotificationsUnreadCount();
      setIsRefreshUnreadMessageNumber(false);
    }
  }, [isRefreshUnreadMessageNumber]);
  return {
    announcementList,
    handleShowAnnouncementDetail,
    handleCloseAnnouncement,
  };
};

export default useNavAnnouncement;
