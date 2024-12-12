"use client";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";

import Navbar from "./components/navbar";
import SuperNavbar from "./components/navbar/SuperNavbar";
import Sidebar from "./components/sidebar";
import SuperSidebar from "./components/sidebar/SuperSidebar";
import useLayout from "./hooks/useLayout";

export default function PagesLayout({
  isSuperAdmin = false,
  children,
}: Readonly<{
  children: React.ReactNode;
  isSuperAdmin?: boolean;
}>) {
  const { isCollapse, device, setIsCollapse } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  useLayout();

  const isMobile = useMemo(() => device === "mobile", [device]);

  const mainMarginLeft = useMemo(() => {
    if (isMobile) return 0;

    if (isCollapse) return "var(--sidebar-collapse-width)";

    return "var(--sidebar-width)";
  }, [isCollapse, isMobile]);

  return (
    <div className="relative h-full bg-background flex">
      {isMobile && !isCollapse && (
        <div
          className="drawer-bg"
          onClick={() => {
            setIsCollapse(true);
          }}
        />
      )}

      {isSuperAdmin ? <SuperSidebar /> : <Sidebar />}

      <main
        className="transition-margin-left duration-300 w-[100%] h-[100%] flex flex-col"
        style={{
          marginLeft: mainMarginLeft,
        }}
      >
        {isSuperAdmin ? (
          <SuperNavbar left={mainMarginLeft} />
        ) : (
          <Navbar left={mainMarginLeft} />
        )}

        <div className={cn("flex-1 pt-[70px]")}>{children}</div>
      </main>
    </div>
  );
}
