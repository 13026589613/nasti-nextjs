"use client";
import { create } from "zustand";

interface UserStateTypes {
  permission: string[];
  setPermission: (isOnboarding: string[]) => void;
}

const useAuthStore = create<UserStateTypes>((set) => ({
  permission: [],

  setPermission: (permission: string[]) => {
    set(() => ({
      permission,
    }));
  },
}));

export default useAuthStore;
