"use client";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getPermissionList } from "@/api/adminUser";
import { getUserInfoApi } from "@/api/auth";
import { WHITE_URL_LIST } from "@/constant/authConstants";
import { getNumberOfWeek } from "@/constant/listOption";
import useAppStore from "@/store/useAppStore";
import useAuthStore from "@/store/useAuthStore";
import useTimeStore from "@/store/useTimeStore";
import useTokenStore from "@/store/useTokenStore";
import useUserStore from "@/store/useUserStore";

const AuthProvide = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useTokenStore((state) => state.accessToken);
  const pathname = usePathname();
  const router = useRouter();

  const { operateCommunity } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const {
    isRefreshAuth,
    isRefreshAuthWithoutLoading,
    refreshPermissionCommunityId,
    isRefreshCommunity,
    setRefreshPermissionCommunityId,
    setIsRefreshAuthWithoutLoading,
    setIsRefreshAuth,
  } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const [isPageLoading, setIsPageLoading] = useState(true);

  const [hasLoadUserInfo, setHasLoadUserInfo] = useState(false);

  const getUserInfo = async (isLoading: boolean) => {
    try {
      if (isLoading && !isPageLoading) {
        setIsPageLoading(true);
      }

      const res = await getUserInfoApi();
      if (res.code === 200) {
        useUserStore.getState().setUserInfo({
          id: res.data.id,
          email: res.data.email,
          phone: res.data.phone,
          isEnabled: res.data.isEnabled,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          middleName: res.data.middleName,
          portraitFileId: res.data.portraitFileId,
        });

        const { isSuperAdmin } = useTokenStore.getState();

        if (
          (isSuperAdmin && !pathname.startsWith("/admin")) ||
          (!isSuperAdmin && pathname.startsWith("/admin"))
        ) {
          router.replace("/login");
        }

        if (isSuperAdmin) {
          setHasLoadUserInfo(true);
          return;
        }

        useUserStore.getState().setCommunityList(res.data.communitList);

        useUserStore
          .getState()
          .setInactiveCommunity(res.data.inactiveCommunity);

        let onboarding = false;
        if (res.data.inactiveCommunity.length === 0) {
          onboarding = false;
        } else {
          res.data.inactiveCommunity.forEach((item) => {
            if (item.isConfirmed) {
              onboarding = true;
            }
          });
        }

        if (!res.data.operateCommunity) {
          onboarding = false;
        } else {
          if (res.data.operateCommunity.isConfirmed) {
            onboarding = true;
          } else {
            onboarding = false;
          }
        }

        useUserStore.getState().setIsOnboarding(onboarding);

        if (onboarding) {
          setHasLoadUserInfo(true);
        }

        if (res.data.operateCommunity) {
          await getPermission(res.data.operateCommunity.id as string, false);
          useUserStore
            .getState()
            .setOperateCommunity(res.data.operateCommunity);

          useTimeStore.getState().setGlobalTimeZone({
            globalTimeZone: res.data.operateCommunity.zoneId as string,
            zoneAbbr: res.data.operateCommunity.zoneShortName as string,
          });

          useTimeStore
            .getState()
            .setWeekOfStart(
              getNumberOfWeek(
                res.data.operateCommunity.startOfWeek as string
              ) === 7
                ? 0
                : getNumberOfWeek(
                    res.data.operateCommunity.startOfWeek as string
                  )
            );
        }

        if (
          !res.data.operateCommunity?.isConfirmed &&
          pathname !== "/onboarding/community"
        ) {
          router.push("/myCommunity");
        }
      } else {
        router.push("/login");
      }
    } finally {
      if (isLoading) {
        setIsPageLoading(false);
      }
    }
  };

  const getPermission = async (userId: string, isLoading: boolean) => {
    if (isLoading) {
      setIsPageLoading(true);
    }

    try {
      const res = await getPermissionList(userId);

      if (res.code === 200) {
        useAuthStore
          .getState()
          .setPermission(res.data.map((item) => item.permissionCode));
      }
    } finally {
      setIsPageLoading(false);
    }
  };

  const initTimeSetting = () => {
    // moment.tz.setDefault(operateCommunity.zoneId as string);
    moment.updateLocale("en", {
      week: {
        dow:
          getNumberOfWeek(operateCommunity.startOfWeek as string) === 7
            ? 0
            : getNumberOfWeek(operateCommunity.startOfWeek as string),
      },
    });
  };

  //Get user information
  useEffect(() => {
    const isWhitePage = WHITE_URL_LIST.includes(pathname);
    if (accessToken && !isWhitePage && !hasLoadUserInfo) {
      getUserInfo(true);
    }
  }, [accessToken, pathname, hasLoadUserInfo]);

  //Internal page triggers refresh user information
  useEffect(() => {
    if (isRefreshAuth) {
      getUserInfo(true);
      setIsRefreshAuth(false);
    }
  }, [isRefreshAuth]);

  //Internal page triggers refresh user information
  useEffect(() => {
    if (isRefreshAuthWithoutLoading) {
      getUserInfo(false);
      setIsRefreshAuthWithoutLoading(false);
    }
  }, [isRefreshAuthWithoutLoading]);

  // //Refresh permission list
  useEffect(() => {
    if (refreshPermissionCommunityId) {
      getPermission(refreshPermissionCommunityId, false);
      setRefreshPermissionCommunityId(null);
    }
  }, [refreshPermissionCommunityId]);

  //Loading will be turned on by default when entering the page, and the whitelist page will be turned on by default.
  useEffect(() => {
    const isWhitePage = WHITE_URL_LIST.includes(pathname);

    if (!isWhitePage) {
      if (accessToken) {
        if (pathname === "/") {
          const { isSuperAdmin } = useTokenStore.getState();

          isSuperAdmin
            ? router.replace("/admin/company")
            : router.replace("/currentSchedule");
        }
      } else {
        router.replace("/login");
        setIsPageLoading(false);
        setHasLoadUserInfo(false);
      }
    } else {
      setIsPageLoading(false);
      setHasLoadUserInfo(false);
    }
  }, [pathname, accessToken]);

  useEffect(() => {
    if (operateCommunity) {
      initTimeSetting();
    }
  }, [operateCommunity]);

  //When modifying community settings on the setting page, you need to refresh the current community information
  useEffect(() => {
    if (isRefreshCommunity && pathname === "/myCommunity") {
      getUserInfo(false);
    }
  }, [isRefreshCommunity, pathname]);

  return (
    <>
      {isPageLoading && (
        <div className="h-[100%] flex justify-center items-center">
          <Loader2 className="w-[30px] h-[30px] animate-spin" />
        </div>
      )}
      {!isPageLoading && children}
    </>
  );
};

export default AuthProvide;
