import { useUpdateEffect } from "ahooks";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getAllUnreadCount } from "@/api/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useNotification from "@/hooks/useNotification";
import useUserInfo from "@/hooks/useUserInfo";
import useAppStore from "@/store/useAppStore";
import useChatMessageStore from "@/store/useChatMessageStore";
import AdminUserIcon from "~/icons/AdminUserIcon.svg";
// import AgencyEmployeesIcon from "~/icons/AgencyEmployeesIcon.svg";
import AnnouncementsIcon from "~/icons/AnnouncementsIcon.svg";
import AttendanceIcon from "~/icons/AttendanceIcon.svg";
import CommunitySettingIcon from "~/icons/CommunitySettingIcon.svg";
import CurrentScheduleIcon from "~/icons/CurrentScheduleIcon.svg";
import EmployeesIcon from "~/icons/EmployeesIcon.svg";
import MessagesIcon from "~/icons/MessagesIcon.svg";
import NotificationsIcon from "~/icons/NotificationsIcon.svg";
import ReportsIcon from "~/icons/ReportsIcon.svg";
import SchedulePlannerIcon from "~/icons/ScheduleIcon.svg";
import ShiftssIcon from "~/icons/ShiftssIcon.svg";
import ScheduleTemplatesIcon from "~/icons/TemplateIcon.svg";
import TimeOffIcon from "~/icons/TimeOffIcon.svg";

import SidebarLogo from "./components/SidebarLogo";
import SidebarMenuItem from "./components/SidebarMenuItem";
import useMenuNumber from "./hooks/useMenuNumber";

const Sidebar = () => {
  const { isCollapse, device, isRefreshMenu, setIsRefreshMenu } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const {
    isReceivedMessage,
    newMessage,
    currentChannelArn,
    isRefreshUnRead,

    setIsRefreshUnRead,
    setIsReceivedMessage,
  } = useChatMessageStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const { communityId, attendanceEnabled } = useGlobalCommunityId();

  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const { unreadNum } = useNotification();

  const [isDownload, setIsDownload] = useState(false);

  const getChatUnreadCount = async (communityId: string) => {
    setIsDownload(false);
    try {
      const { data, code } = await getAllUnreadCount(communityId);
      if (code === 200) {
        setChatUnreadCount(data);
      }
    } finally {
      setIsDownload(true);
    }
  };

  const { timeOffRequest, needHelpShiftCount, attendanceCount, refresh } =
    useMenuNumber({});

  //Refresh the left menu
  useEffect(() => {
    if (isRefreshMenu) {
      getChatUnreadCount(communityId);
      refresh();
      setIsRefreshMenu(false);
    }
  }, [isRefreshMenu]);

  //Refresh the chat unread count
  useEffect(() => {
    if (isRefreshUnRead && isDownload) {
      getChatUnreadCount(communityId);
      setIsRefreshUnRead(false);
    }
  }, [isRefreshUnRead, isDownload]);

  const { userId } = useUserInfo();

  //Update the chat unread count
  useEffect(() => {
    if (isReceivedMessage) {
      setIsReceivedMessage(false);
      if (newMessage.ChannelArn !== currentChannelArn) {
        if (newMessage.Sender.Name !== userId) {
          setChatUnreadCount(chatUnreadCount + 1);
        }
      }
    }
  }, [isReceivedMessage]);

  //initialize the menu unread message count
  useEffect(() => {
    if (communityId) {
      getChatUnreadCount(communityId);
    }
  }, []);

  useUpdateEffect(() => {
    if (communityId) {
      getChatUnreadCount(communityId);
    }
  }, [communityId]);

  const menuData = useMemo(() => {
    const menuData = [
      {
        title: "Current Schedule",
        icon: <CurrentScheduleIcon />,
        link: "/currentSchedule",
        included: ["/currentSchedule"],
      },
      {
        title: "Schedule Planner",
        icon: <SchedulePlannerIcon />,
        link: "/schedulePlanner",
        included: ["/schedulePlanner"],
      },
      {
        title: "Schedule Templates",
        icon: <ScheduleTemplatesIcon />,
        link: "/scheduleTemplates",
        included: ["/scheduleTemplates", "/scheduleTemplates/edit"],
      },
      {
        title: "Shifts That Need Help",
        icon: <ShiftssIcon />,
        link: "/shiftsNeedHelp",
        included: ["/shiftsNeedHelp"],
      },
      {
        title: "Community Settings",
        icon: <CommunitySettingIcon />,
        link: "/myCommunity",
        included: ["/myCommunity"],
      },
      {
        title: "Time Off",
        icon: <TimeOffIcon />,
        link: "/timeOff",
        included: ["/timeOff"],
      },
      {
        title: "Time And Attendance",
        icon: <AttendanceIcon />,
        link: "/timeAndAttendance",
        included: ["/timeAndAttendance"],
      },
      {
        title: "Admin Users",
        icon: <AdminUserIcon />,
        link: "/adminUser",
        included: ["/adminUser"],
      },
      {
        title: "Employees",
        icon: <EmployeesIcon />,
        link: "/employees",
        included: ["/employees"],
      },
      // {
      //   title: "Agency Employees",
      //   icon: <AgencyEmployeesIcon />,
      //   link: "/",
      //   included: ["/"],
      // },
      {
        title: "Messages",
        icon: <MessagesIcon />,
        link: "/messages",
        included: ["/messages"],
      },
      {
        title: "Notifications",
        icon: <NotificationsIcon />,
        link: "/notifications",
        included: ["/notifications"],
      },
      {
        title: "Announcements",
        icon: <AnnouncementsIcon />,
        link: "/announcements",
        included: ["/announcements"],
      },
      {
        title: "Reports",
        icon: <ReportsIcon />,
        link: "/reports",
        included: ["/reports"],
      },
    ];
    if (attendanceEnabled) {
      return menuData;
    } else {
      return menuData.filter((item) => item.title !== "Time And Attendance");
    }
  }, [attendanceEnabled]);

  return (
    <div
      className={clsx(
        "fixed z-[10] top-0 left-0 right-0 bottom-0 h-full bg-background transition-width duration-300 shadow-borderShadow",
        {
          "layout-mobile": device === "mobile",
          hideSidebar: isCollapse,
          openSidebar: !isCollapse,
        }
      )}
      style={{
        boxShadow: "var(--borderShadow)",
        width: isCollapse
          ? "var(--sidebar-collapse-width)"
          : "var(--sidebar-width)",
      }}
    >
      <SidebarLogo isCollapse={isCollapse} />

      <ScrollArea className="w-full h-[calc(100vh-67px)] overflow-auto pt-[10px] pb-[10px]">
        {menuData.map((item, i) => {
          let unRead: number | null = null;
          if (item.title === "Time Off") {
            unRead = timeOffRequest ? timeOffRequest : null;
          } else if (item.title === "Shifts That Need Help") {
            unRead = needHelpShiftCount ? needHelpShiftCount : null;
          } else if (item.title === "Notifications") {
            unRead = unreadNum ? unreadNum : null;
          } else if (item.title === "Messages") {
            unRead = chatUnreadCount || null;
          } else if (item.title === "Time And Attendance") {
            unRead = attendanceCount || null;
          }
          return (
            <SidebarMenuItem
              key={i}
              {...item}
              isCollapse={isCollapse}
              unRead={unRead}
            />
          );
        })}
      </ScrollArea>
    </div>
  );
};
export default Sidebar;
