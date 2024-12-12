import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DeviceType = "desktop" | "table" | "mobile";

interface AppStateTypes {
  isCollapse: boolean;
  device: DeviceType;
  isShowTopSelect: boolean;
  step: number;
  isNavbarDisabled: boolean;
  isRefreshAuth: boolean;
  isRefreshAuthWithoutLoading: boolean;
  isRefreshCommunity: boolean;
  isRefreshDepartment: boolean;
  isRefreshInner: boolean; // click menu refresh inner
  isRefreshMenu: boolean; // refresh menu count
  refreshPermissionCommunityId: string | null;
  navbarWidth: number;
  isRefreshAttendance: boolean;

  setNavBarWidth: (value: number) => void;

  setIsShowTopSelect: (value: boolean) => void;
  setIsRefreshMenu: (value: boolean) => void;
  setIsNavbarDisabled: (value: boolean) => void;
  setRefreshPermissionCommunityId: (value: string | null) => void;
  setIsRefreshAuthWithoutLoading: (value: boolean) => void;
  setIsRefreshInner: (value: boolean) => void;
  toggleCollapse: () => void;
  setIsCollapse: (value: boolean) => void;
  setDevice: (value: DeviceType) => void;
  setStep: (value: number) => void;
  setIsRefreshAuth: (value: boolean) => void;
  setIsRefreshCommunity: (value: boolean) => void;
  setIsRefreshDepartment: (value: boolean) => void;
  reSetAppStore: () => void;
}

const useAppStore = create(
  persist<AppStateTypes>(
    (set) => ({
      isShowTopSelect: false,
      isCollapse: false,
      isRefreshCommunity: false,
      isRefreshDepartment: false,
      isRefreshInner: false,
      isRefreshAuthWithoutLoading: false,
      refreshPermissionCommunityId: null,
      device: "desktop",
      step: 1,
      isRefreshAuth: false,
      isNavbarDisabled: false,
      isRefreshMenu: false,
      navbarWidth: 0,
      isRefreshAttendance: false,
      setNavBarWidth: (value: number) => {
        set(() => ({ navbarWidth: value }));
      },
      setIsShowTopSelect: (value: boolean) => {
        set(() => ({ isShowTopSelect: value }));
      },
      setIsRefreshMenu: (value: boolean) => {
        set(() => ({ isRefreshMenu: value }));
      },
      setIsNavbarDisabled: (value: boolean) => {
        set(() => ({ isNavbarDisabled: value }));
      },
      setRefreshPermissionCommunityId: (value: string | null) => {
        set(() => ({ refreshPermissionCommunityId: value }));
      },
      setIsRefreshAuthWithoutLoading(value: boolean) {
        set(() => ({ isRefreshAuthWithoutLoading: value }));
      },
      setIsRefreshInner(value: boolean) {
        set(() => ({ isRefreshInner: value }));
      },
      setIsRefreshCommunity(value: boolean) {
        set(() => ({ isRefreshCommunity: value }));
      },
      setIsRefreshDepartment(value: boolean) {
        set(() => ({ isRefreshDepartment: value }));
      },
      toggleCollapse() {
        set((state) => ({ isCollapse: !state.isCollapse }));
      },
      setIsCollapse(value: boolean) {
        set(() => ({ isCollapse: value }));
      },
      setDevice(value: DeviceType) {
        set(() => ({ device: value }));
      },
      setStep(value: number) {
        set(() => ({ step: value }));
      },
      setIsRefreshAuth(value: boolean) {
        set(() => ({ isRefreshAuth: value }));
      },
      reSetAppStore() {
        set(() => ({
          step: 1,
        }));
      },
    }),
    {
      name: "freebird-app-store",
    }
  )
);

export default useAppStore;
