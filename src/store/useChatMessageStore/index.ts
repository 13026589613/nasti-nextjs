"use client";

import { create } from "zustand";

interface UseChatMessageStoreTypes {
  newMessage: any;
  isRefreshUnRead: boolean;
  isReceivedMessage: boolean;
  isRefreshChannel: boolean;
  currentChannelArn: string;
  setIsReceivedMessage: (isReceivedMessage: boolean) => void;
  setCurrentChannelArn: (currentChannelArn: string) => void;
  setIsRefreshChannel: (isRefreshChannel: boolean) => void;
  setIsRefreshUnRead: (isRefreshUnRead: boolean) => void;
  setNewMessage: (newMessage: any) => void;
}

const useChatMessageStore = create<UseChatMessageStoreTypes>((set, get) => ({
  newMessage: null,
  isRefreshUnRead: false,
  isRefreshChannel: false,
  currentChannelArn: "",
  isReceivedMessage: false,
  setIsReceivedMessage: (isReceivedMessage) => set({ isReceivedMessage }),
  setCurrentChannelArn: (currentChannelArn) => set({ currentChannelArn }),
  setIsRefreshChannel: (isRefreshChannel) => set({ isRefreshChannel }),
  setIsRefreshUnRead: (isRefreshUnRead) => set({ isRefreshUnRead }),
  setNewMessage: (newMessage) => set({ newMessage }),
}));

export default useChatMessageStore;
