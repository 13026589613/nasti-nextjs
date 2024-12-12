"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { signOutApi } from "@/api/auth";

interface AuthStateTypes {
  accessToken: string;
  setAccessToken: (accessToken: string) => void;
  userRole: string;
  setUserRole: (userRole: string) => void;
  isSuperAdmin: boolean;
  logout: () => void;
}

const useTokenStore = create(
  persist<AuthStateTypes>(
    (set) => ({
      accessToken: "",
      setAccessToken: (accessToken: string) => {
        set(() => ({
          accessToken,
        }));
      },
      isSuperAdmin: false,
      userRole: "",
      setUserRole: (userRole: string) => {
        set(() => ({
          userRole,
          isSuperAdmin: !!userRole?.includes("ADMIN"),
        }));
      },
      async logout() {
        await signOutApi();
        set(() => ({
          accessToken: "",
        }));
      },
    }),
    {
      name: "freebird-auth-store",
    }
  )
);

export default useTokenStore;
