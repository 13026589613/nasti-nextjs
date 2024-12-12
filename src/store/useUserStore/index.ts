"use client";
import { create } from "zustand";

import {
  CommunityList,
  InactiveCommunity,
  OperateCommunity,
  UserInfoType,
} from "./types";

interface UserStateTypes {
  userInfo: UserInfoType;
  operateCommunity: OperateCommunity;
  inactiveCommunity: InactiveCommunity;
  communityList: CommunityList;
  isOnboarding: boolean;
  setIsOnboarding: (isOnboarding: boolean) => void;
  setOperateCommunity: (operateCommunity: OperateCommunity) => void;
  setUserInfo: (userInfo: UserInfoType) => void;
  setInactiveCommunity: (inactiveCommunity: InactiveCommunity) => void;
  setCommunityList: (communityList: CommunityList) => void;
  reset: () => void;
}

const useUserStore = create<UserStateTypes>((set) => ({
  userInfo: {},
  communityList: [],
  inactiveCommunity: [],
  operateCommunity: {},
  isOnboarding: true,
  setOperateCommunity: (operateCommunity: OperateCommunity) => {
    set(() => ({
      operateCommunity,
    }));
  },
  setUserInfo: (userInfo: UserInfoType) => {
    set(() => ({
      userInfo,
    }));
  },
  setIsOnboarding: (isOnboarding: boolean) => {
    set(() => ({
      isOnboarding,
    }));
  },
  setCommunityList: (communityList: CommunityList) => {
    set(() => ({
      communityList,
    }));
  },
  setInactiveCommunity: (inactiveCommunity: InactiveCommunity) => {
    set(() => ({
      inactiveCommunity,
    }));
  },
  reset: () => {
    set(() => ({
      userInfo: {},
      communityList: [],
      inactiveCommunity: [],
      operateCommunity: {},
      isOnboarding: true,
    }));
  },
}));

export default useUserStore;
