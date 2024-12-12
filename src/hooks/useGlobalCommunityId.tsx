import { useShallow } from "zustand/react/shallow";

import { getNumberOfWeek } from "@/constant/listOption";
import useUserStore from "@/store/useUserStore";

const useGlobalCommunityId = () => {
  const { operateCommunity } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  return {
    companyId: operateCommunity?.companyId || "",
    isConfirmed: operateCommunity?.isConfirmed || false,
    communityId: operateCommunity?.id || "",
    userCommunityRefId: operateCommunity?.userCommunityRefId || "",
    attendanceEnabled: operateCommunity.attendanceEnabled,
    startOfWeek:
      getNumberOfWeek(operateCommunity.startOfWeek as string) === 7
        ? 0
        : getNumberOfWeek(operateCommunity.startOfWeek as string),
  };
};

export default useGlobalCommunityId;
