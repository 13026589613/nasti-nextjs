"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import useChatWebsocket from "@/hooks/useChatWebsocket";
import useQuantityWebsocket from "@/hooks/useQuantityWebsocket";
import useAppStore from "@/store/useAppStore";
import useChatMessageStore from "@/store/useChatMessageStore";

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

  const { setNewMessage, setIsReceivedMessage, setIsRefreshChannel } =
    useChatMessageStore(
      useShallow((state) => ({
        ...state,
      }))
    );

  const { connectWebsocket, close } = useChatWebsocket({
    messageDidReceive: (message) => {
      setIsReceivedMessage(true);
      setNewMessage(message);
    },
    channelsChanged() {
      setIsRefreshChannel(true);
    },
    channelMembershipsChanged() {
      setIsRefreshChannel(true);
    },
  });

  useEffect(() => {
    connectWebsocket();
    return () => {
      close();
    };
  }, []);

  useQuantityWebsocket();

  return <PagesLayout>{!isRefreshInner && children}</PagesLayout>;
}
