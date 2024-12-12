"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import useAppStore from "@/store/useAppStore";

const PagesLayout = dynamic(() => import("@/layout"), { ssr: false });

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isRefreshInner, setIsRefreshInner } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  useEffect(() => {
    if (isRefreshInner) {
      setIsRefreshInner(false);
    }
  }, [isRefreshInner]);

  return <PagesLayout isSuperAdmin>{!isRefreshInner && children}</PagesLayout>;
}
