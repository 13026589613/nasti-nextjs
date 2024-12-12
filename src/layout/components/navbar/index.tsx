"use client";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import { useShallow } from "zustand/react/shallow";

import { userInfoDataResVO } from "@/api/announcements/type";
import { getInvitePendingCount } from "@/api/invitations";
// import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import NumberCircle from "@/components/custom/NumberCircle/numberCircleRelative";
import useDayViewWidth from "@/components/schedules/hooks/useDayViewWidth";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useNotification from "@/hooks/useNotification";
import useMenuNumber from "@/layout/components/sidebar/hooks/useMenuNumber";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useDepartmentStore from "@/store/useDepartmentStore";
import useTokenStore from "@/store/useTokenStore";
import useUserStore from "@/store/useUserStore";
import { getImageFile } from "@/utils/getFileUrl";
import { cancelAllRequests } from "@/utils/http";
import CloseIcon from "~/icons/CloseIcon.svg";
import CollapseIcon from "~/icons/CollapseIcon.svg";
// import DarkIcon from "~/icons/DarkIcon.svg";
import DownArrowTriangleIcon from "~/icons/DownArrowTriangleIcon.svg";
import ExpandIcon from "~/icons/ExpandIcon.svg";
// import LightIcon from "~/icons/LightIcon.svg";
import NotificationIcon from "~/icons/NotificationIcon.svg";
import NotificationsIcon from "~/icons/NotificationsIcon.svg";
import SettingIcon from "~/icons/SettingIcon.svg";

import useNavAnnouncement from "../../hooks/useNavAnnouncement";
import NotificationsList from "./notificationList";
import Select from "./select";
import SelectVertical from "./selectVertical";
interface NavBarProps {
  left: string | number;
}

const NavBar = (props: NavBarProps) => {
  const { left } = props;
  const { theme } = useTheme();

  const { unreadNum } = useNotification();

  const { inactiveCommunity, userInfo } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const { isCollapse, isShowTopSelect } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const [open, setOpen] = useState(false);

  const { invitePendingCount } = useMenuNumber({});

  const [count, setCount] = useState(invitePendingCount);

  const router = useRouter();

  const [announcementInfo, setAnnouncementInfo] = useState<{
    open: boolean;
    data?: userInfoDataResVO | null;
  }>({
    open: false,
    data: null,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { wrapperWidth } = useDayViewWidth(wrapperRef);

  const getInviteCount = async () => {
    const { data, code } = await getInvitePendingCount();
    if (code === 200) {
      setCount(data);
    }
  };

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

  useEffect(() => {
    // record Left Menu collapse status
    const MENU_COLLAPSE = window.localStorage.getItem("MENU_COLLAPSE");
    if (
      typeof MENU_COLLAPSE === "string" &&
      (MENU_COLLAPSE === "true" || MENU_COLLAPSE === "false")
    ) {
      useAppStore.getState().setIsCollapse(MENU_COLLAPSE === "true");
    }
  }, [inactiveCommunity]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    slidesToScroll: 1,
    autoplay: true,
    vertical: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    arrows: false,
  };
  const {
    announcementList,
    handleShowAnnouncementDetail,
    handleCloseAnnouncement,
  } = useNavAnnouncement({
    setAnnouncementInfo,
  });
  return (
    <div
      ref={wrapperRef}
      className="fixed top-0  right-0 h-[68px] flex items-center z-[9] bg-background transition-margin-left duration-300 p-[0_20px]"
      style={{
        boxShadow:
          theme === "light"
            ? "0px 8px 14px 0px rgba(216,221,230,0.5)"
            : undefined,
        left,
      }}
    >
      {announcementList.length !== 0 && (
        <div className="cursor-pointer absolute  px-4 w-5/6 z-50 bg-[#FFE8E5] h-10 rounded border-[1px] border-[#EB1DB2]">
          <NotificationsIcon
            className="w-10 absolute top-1/2 -translate-y-1/2"
            color="#FB553C"
            width="16px"
            height="16px"
          />
          <div className="ml-10 w-[95%] absolute">
            <Slider {...sliderSettings}>
              {announcementList.map((item, index) => {
                return (
                  <div key={index}>
                    <div
                      className="flex justify-between items-center w-full h-10"
                      onClick={() => {
                        handleShowAnnouncementDetail(item.announcementId);
                      }}
                    >
                      <div className="mx-4 text-ellipsis whitespace-nowrap overflow-hidden">
                        {item.content}
                      </div>
                      <CloseIcon
                        onClick={(e: any) => {
                          e.stopPropagation();

                          handleCloseAnnouncement(item.announcementId);
                        }}
                        className="w-10"
                        width="12px"
                        height="12px"
                      />
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        </div>
      )}

      <CustomDialog
        title="Announcement Detail"
        open={announcementInfo.open}
        onClose={() => {
          setAnnouncementInfo({
            open: false,
          });
        }}
      >
        <div className="min-h-[30vh] text-wrap break-words max-h-[75vh] overflow-y-auto">
          {announcementInfo.data?.content}
        </div>
      </CustomDialog>
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
      <Select className={cn(!isShowTopSelect && "hidden")}></Select>
      <Popover>
        <PopoverTrigger
          className={cn("ml-auto mr-5", isShowTopSelect && "hidden")}
        >
          <SettingIcon className="w-5 h-5 ml-auto"></SettingIcon>
        </PopoverTrigger>
        <PopoverContent className="w-[450px]" align="end">
          <SelectVertical></SelectVertical>
        </PopoverContent>
      </Popover>

      <div
        className={cn("flex items-center", !isShowTopSelect ? "" : "ml-[auto]")}
      >
        {/* theme */}
        {/* <div
          className="flex items-center cursor-pointer w-[25px] h-[25px]"
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

        <div className="ml-[20px] pr-[20px]">
          <Popover>
            <PopoverTrigger className="flex items-center justify-center">
              <div className="relative">
                {![null, 0].includes(unreadNum) && (
                  <div className="absolute top-0 right-0 rounded w-[5px] h-[5px] bg-[#F66664]"></div>
                )}
                <NotificationIcon width="20px" height="20px" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] pr-2" align="center">
              <NotificationsList></NotificationsList>
            </PopoverContent>
          </Popover>
        </div>

        <span>|</span>

        <DropdownMenu
          open={open}
          onOpenChange={() => {
            setOpen(!open);
            if (!open) {
              getInviteCount();
            }
          }}
        >
          <DropdownMenuTrigger className="flex items-center pl-[20px] text-[#425570] dark:text-white">
            <div className="relative">
              <Avatar
                className="mr-[8px] border-cyan-700"
                style={{ border: "2px solid #EB1DB2" }}
              >
                <AvatarImage
                  src={
                    userInfo?.portraitFileId
                      ? getImageFile(userInfo.portraitFileId)
                      : "/images/defaultLogo.png"
                  }
                />
              </Avatar>
              {count !== 0 && (
                <div
                  className="w-1.5 h-1.5 rounded absolute top-0 right-1"
                  style={{ background: "#F5894E" }}
                ></div>
              )}
            </div>
            <span className="mr-[5px] font-[390]">
              {userInfo.firstName} {userInfo.lastName}
            </span>

            <DownArrowTriangleIcon width="15px" height="10px" />
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                router.push("/profile");
              }}
            >
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                router.push("/invitations");
              }}
            >
              <span className="mr-[7px]">Invitations Pending</span>
              <NumberCircle number={count}></NumberCircle>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                router.push("/changePassword");
              }}
            >
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NavBar;
