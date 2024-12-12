import { useEffect, useState } from "react";

import { getUserDepartmentList } from "@/api/user";
import { GetUserDepartmentListResponse } from "@/api/user/types";
import { websocketUrl } from "@/env";
import useMenuNumStore from "@/store/useMenuNumStore";
import useNotificationStore from "@/store/useNotificationStore";
import useTokenStore from "@/store/useTokenStore";

import useGlobalCommunityId from "./useGlobalCommunityId";
import useUserInfo from "./useUserInfo";
import useWebSocket from "./useWebSocket";

const useQuantityWebsocket = () => {
  const { communityId, isConfirmed } = useGlobalCommunityId();

  const { userId } = useUserInfo();

  const [departmentList, setDepartmentList] = useState<
    GetUserDepartmentListResponse[]
  >([]);

  const { send, open, close, isConnected } = useWebSocket({
    url: `${websocketUrl}/api/service/pub/websocket/quantity/${
      useTokenStore.getState().accessToken
    }`,
    openPing: true,
    onMessage: (message) => {
      const data = JSON.parse(message.data);

      if (data.code === "SHIFTS_THAT_NEED_HELP") {
        useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
      } else if (data.code === "TIME_OFF") {
        useMenuNumStore.getState().setIsRefreshTimeOff(true);
      } else if (data.code === "TIME_AND_ATTENDANCE") {
        useMenuNumStore.getState().setIsRefreshShiftTimeAndAttendance(true);
      } else if (data.code === "NOTIFICATION_USER_NEW") {
        const body = data.body;
        if (body === "NOTIFICATION_USER_NEW") {
          useNotificationStore.getState().setIsRefreshUnreadMessageNumber(true);
        }
      } else if (data.code === "INVITE_NOTIFY") {
        useMenuNumStore.getState().setIsRefreshInvitationPending(true);
      }
    },
  });

  const getUserDepartmentListFn = async (communityId: string) => {
    const res = await getUserDepartmentList({ communityId });

    if (res.code === 200) {
      setDepartmentList(res.data);
    }
  };

  useEffect(() => {
    if (communityId && isConfirmed) {
      getUserDepartmentListFn(communityId);
      setDepartmentList([]);
      open();
    }
  }, [communityId, isConfirmed]);

  useEffect(() => {
    if (isConnected && departmentList.length > 0) {
      send(
        JSON.stringify({
          userId,
          communityId,
          departmentIds: departmentList.map((item) => item.id),
        })
      );
    }
  }, [isConnected, departmentList]);

  useEffect(() => {
    return () => {
      close();
    };
  }, []);

  return { send, open, close };
};

export default useQuantityWebsocket;
