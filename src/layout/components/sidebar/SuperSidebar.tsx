import clsx from "clsx";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ScrollArea } from "@/components/ui/scroll-area";
import useAppStore from "@/store/useAppStore";
import AdminUserIcon from "~/icons/AdminUserIcon.svg";
import CommunitySettingIcon from "~/icons/CommunitySettingIcon.svg";
import CompanyIcon from "~/icons/CompanyIcon.svg";
import EmployeesIcon from "~/icons/EmployeesIcon.svg";
import SettingsIcon from "~/icons/SettingsIcon.svg";
import SuperAdminUsersIcon from "~/icons/SuperAdminUsersIcon.svg";

import SidebarLogo from "./components/SidebarLogo";
import SidebarMenuItem from "./components/SidebarMenuItem";
const SuperSidebar = () => {
  const { isCollapse, device } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const menuData = useMemo(() => {
    const menuData = [
      {
        title: "Companies",
        icon: <CompanyIcon />,
        link: "/admin/company",
        included: ["/admin/company"],
      },
      {
        title: "Communities",
        icon: <CommunitySettingIcon />,
        link: "/admin/community",
        included: ["/admin/community"],
      },
      {
        title: "Community Admins",
        icon: <AdminUserIcon />,
        link: "/admin/adminuser",
        included: ["/admin/adminuser"],
      },
      {
        title: "Community Employees",
        icon: <EmployeesIcon />,
        link: "/admin/employees",
        included: ["/admin/employees"],
      },
      {
        title: "Super Admins",
        icon: <SuperAdminUsersIcon />,
        link: "/admin/superadminuser",
        included: ["/admin/superadminuser"],
      },
      // {
      //   title: "Settings",
      //   icon: <SettingsIcon />,
      //   link: "/admin/dictionary",
      //   included: ["/admin/dictionary"],
      // },
      {
        title: "Settings",
        icon: <SettingsIcon />,
        link: "/admin/pbjJob",
        included: ["/admin/pbjJob"],
      },
    ];
    return menuData;
  }, []);

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
          return <SidebarMenuItem key={i} {...item} isCollapse={isCollapse} />;
        })}
      </ScrollArea>
    </div>
  );
};
export default SuperSidebar;
