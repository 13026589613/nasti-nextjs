import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getInvitePendingCount } from "@/api/invitations";
import { getNeedCoverageCount } from "@/api/shiftsThatNeedHelp";
import { getUnreadAttendanceCount } from "@/api/timeAndAttendance";
import { userTimeOffRequestCount } from "@/api/timeOff";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useMenuNumStore from "@/store/useMenuNumStore";
interface UseMenuNumberProps {}

const useMenuNumber = (props: UseMenuNumberProps) => {
  const {} = props;

  const { communityId, attendanceEnabled } = useGlobalCommunityId();

  const {
    isRefreshShiftNeedHelp,
    setIsRefreshShiftNeedHelp,
    isRefreshTimeOff,
    setIsRefreshTimeOff,
    isRefreshShiftTimeAndAttendance,
    setIsRefreshShiftTimeAndAttendance,
    isRefreshInvitationPending,
    setIsRefreshInvitationPending,
  } = useMenuNumStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const [timeOffRequest, setTimeOffRequest] = useState(0);

  const [needHelpShiftCount, setNeedHelpShiftCount] = useState(0);

  const [attendanceCount, setAttendanceCount] = useState(0);

  const [invitePendingCount, setInvitePendingCount] = useState(0);

  const getUserTimeOffRequestCount = async () => {
    const res = await userTimeOffRequestCount(communityId);
    if (res.code === 200) {
      setTimeOffRequest(res.data ? parseInt(res.data) : 0);
    }
  };

  const getNeedHelpShiftCount = async () => {
    const { data, code } = await getNeedCoverageCount(communityId);
    if (code === 200) {
      setNeedHelpShiftCount(
        data.callOffCount +
          data.swapsCount +
          data.ufgCount +
          data.overtimeShiftsCount +
          data.openShiftClaimsCount
      );
    }
  };

  const getAttendanceCount = async () => {
    const { data, code } = await getUnreadAttendanceCount(communityId);
    if (code === 200) {
      setAttendanceCount(data);
    }
  };

  const getInviteCount = async () => {
    const { data, code } = await getInvitePendingCount();
    if (code === 200) {
      setInvitePendingCount(data);
    }
  };

  useEffect(() => {
    if (attendanceEnabled) {
      getAttendanceCount();
    }
  }, [attendanceEnabled, communityId]);

  useEffect(() => {
    if (communityId) {
      getUserTimeOffRequestCount();
      getNeedHelpShiftCount();
      getInviteCount();
    }
  }, [communityId]);

  useEffect(() => {
    if (isRefreshShiftNeedHelp) {
      getNeedHelpShiftCount();
      setIsRefreshShiftNeedHelp(false);
    }
  }, [isRefreshShiftNeedHelp]);

  useEffect(() => {
    if (isRefreshTimeOff) {
      getUserTimeOffRequestCount();
      setIsRefreshTimeOff(false);
    }
  }, [isRefreshTimeOff]);

  useEffect(() => {
    if (isRefreshInvitationPending) {
      getInviteCount();
      setIsRefreshInvitationPending(false);
    }
  }, [isRefreshInvitationPending]);

  useEffect(() => {
    if (isRefreshShiftTimeAndAttendance && attendanceEnabled) {
      getAttendanceCount();
      setIsRefreshShiftTimeAndAttendance(false);
    }
  }, [isRefreshShiftTimeAndAttendance]);

  return {
    timeOffRequest,
    needHelpShiftCount,
    attendanceCount,
    invitePendingCount,
    refresh: () => {
      getUserTimeOffRequestCount();
      getNeedHelpShiftCount();
      getInviteCount();
      if (attendanceEnabled) {
        getAttendanceCount();
      }
    },
  };
};

export default useMenuNumber;
