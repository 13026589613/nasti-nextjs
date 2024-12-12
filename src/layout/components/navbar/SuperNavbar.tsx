"use client";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
// import { useTheme } from "next-themes";
import React, { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import useDayViewWidth from "@/components/schedules/hooks/useDayViewWidth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useDepartmentStore from "@/store/useDepartmentStore";
import useTokenStore from "@/store/useTokenStore";
import useUserStore from "@/store/useUserStore";
import { cancelAllRequests } from "@/utils/http";
import CollapseIcon from "~/icons/CollapseIcon.svg";
// import DarkIcon from "~/icons/DarkIcon.svg";
import DownArrowTriangleIcon from "~/icons/DownArrowTriangleIcon.svg";
import ExpandIcon from "~/icons/ExpandIcon.svg";
// import LightIcon from "~/icons/LightIcon.svg";

interface NavBarProps {
  left: string | number;
}

const SuperNavbar = (props: NavBarProps) => {
  const { left } = props;
  // const { theme, setTheme } = useTheme();

  const { userInfo } = useUserStore(useShallow((state) => state));

  const { isCollapse } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const router = useRouter();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { wrapperWidth } = useDayViewWidth(wrapperRef);

  useEffect(() => {
    useAppStore.getState().setNavBarWidth(wrapperWidth);
  }, [wrapperWidth]);

  const handleLogout = () => {
    router.push("/login");
    cancelAllRequests();
    useTokenStore.getState().logout();
    // clear store after router push
    setTimeout(() => {
      useAppStore.getState().reSetAppStore();
      useDepartmentStore.getState().resetStore();
    }, 100);
  };

  return (
    <div
      ref={wrapperRef}
      className="fixed top-0  right-0 h-[68px] flex items-center z-[9] bg-background transition-margin-left duration-300 p-[0_20px]"
      style={{
        boxShadow:
          // theme === "light"
          // ?
          "0px 8px 14px 0px rgba(216,221,230,0.5)",
        // : undefined,
        left,
      }}
    >
      <div
        className="hover:text-primary cursor-pointer"
        onClick={() => {
          useAppStore.getState().toggleCollapse();
          window.localStorage.setItem(
            "MENU_COLLAPSE",
            useAppStore.getState().isCollapse ? "true" : "false"
          );
        }}
      >
        {isCollapse ? (
          <ExpandIcon width="20px" height="17px" />
        ) : (
          <CollapseIcon width="20px" height="17px" />
        )}
      </div>

      <div className={cn("flex items-center ml-[auto]")}>
        {/* theme */}
        {/* <div
          className="flex items-center cursor-pointer w-[25px] h-[25px] mr-[20px]"
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
        >
          {theme === "dark" ? (
            <DarkIcon width="23px" height="23px" color="#fff" />
          ) : (
            <LightIcon width="23px" height="23px" />
          )}
        </div> */}

        {/* <span>|</span> */}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center pl-[20px] text-[#425570] dark:text-white">
            <span className="mr-[5px] font-[390]">
              {userInfo.firstName} {userInfo.lastName}
            </span>

            <DownArrowTriangleIcon width="15px" height="10px" />
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SuperNavbar;
