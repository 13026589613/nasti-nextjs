import { useShallow } from "zustand/react/shallow";

import useUserStore from "@/store/useUserStore";

const useUserInfo = () => {
  const { userInfo } = useUserStore(useShallow((state) => ({ ...state })));
  return {
    userId: userInfo.id,
    userName: userInfo.firstName + " " + userInfo.lastName,
    userEmail: userInfo.email,
    userPhone: userInfo.phone,
  };
};

export default useUserInfo;
