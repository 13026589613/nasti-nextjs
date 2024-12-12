import { useShallow } from "zustand/react/shallow";

import useAuthStore from "@/store/useAuthStore";

const useHasPermission = () => {
  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  return {
    isHasApproveAttendancePermission: permission.includes(
      "SCHEDULE_MANAGEMENT_APPROVE_ATTENDANCE"
    ),
    isHasAnnouncementDeletePermission: permission.includes(
      "ANNOUNCEMENTS_DELETE"
    ),
    isHasAnnouncementAddPermission: permission.includes("ANNOUNCEMENTS_ADD"),
  };
};

export default useHasPermission;
