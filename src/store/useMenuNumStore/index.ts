"use client";
import { create } from "zustand";

interface UseMenuNumStore {
  isRefreshShiftNeedHelp: boolean;
  setIsRefreshShiftNeedHelp: (isRefreshShiftNeedHelp: boolean) => void;
  isRefreshTimeOff: boolean;
  setIsRefreshTimeOff: (isRefreshTimeOff: boolean) => void;
  isRefreshShiftTimeAndAttendance: boolean;
  setIsRefreshShiftTimeAndAttendance: (
    isRefreshShiftTimeAndAttendance: boolean
  ) => void;
  isRefreshInvitationPending: boolean;
  setIsRefreshInvitationPending: (isRefreshInvitationPending: boolean) => void;
}

const useMenuNumStore = create<UseMenuNumStore>((set) => ({
  isRefreshShiftNeedHelp: false,
  setIsRefreshShiftNeedHelp: (isRefreshShiftNeedHelp) =>
    set({ isRefreshShiftNeedHelp }),
  isRefreshTimeOff: false,
  setIsRefreshTimeOff: (isRefreshTimeOff) => set({ isRefreshTimeOff }),
  isRefreshShiftTimeAndAttendance: false,
  setIsRefreshShiftTimeAndAttendance: (isRefreshShiftTimeAndAttendance) =>
    set({ isRefreshShiftTimeAndAttendance }),
  isRefreshInvitationPending: false,
  setIsRefreshInvitationPending: (isRefreshInvitationPending) =>
    set({ isRefreshInvitationPending }),
}));

export default useMenuNumStore;
