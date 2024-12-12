"use client";
import moment from "moment-timezone";
import { create } from "zustand";

type TimeType = string | Date | number | undefined | moment.Moment;

interface UserStateTypes {
  globalTimeZone: string;
  weekOfStart: number;
  zoneAbbr: string;
  receivedTimeZone: string;
  setWeekOfStart: (weekOfStart: number) => void;
  setGlobalTimeZone: (data: {
    globalTimeZone: string;
    zoneAbbr: string;
  }) => void;
  UTCMoment: (
    time: TimeType,
    format?: moment.MomentFormatSpecification
  ) => moment.Moment;
  localMoment: (
    time?: TimeType,
    format?: moment.MomentFormatSpecification
  ) => moment.Moment;
  toGlobalTime: (
    time: TimeType,
    format?: moment.MomentFormatSpecification
  ) => moment.Moment;
}

const useTimeStore = create<UserStateTypes>((set, get) => ({
  globalTimeZone: "",
  zoneAbbr: "UTC",
  weekOfStart: 7,
  receivedTimeZone: "Etc/UTC",
  setGlobalTimeZone: ({ globalTimeZone, zoneAbbr }) => {
    set(() => ({
      globalTimeZone,
      zoneAbbr: zoneAbbr,
    }));
  },
  setWeekOfStart: (weekOfStart: number) => {
    moment.updateLocale("en", {
      week: {
        dow: weekOfStart,
      },
    });
    set(() => ({
      weekOfStart: weekOfStart,
    }));
  },

  UTCMoment: (time: TimeType, format?: moment.MomentFormatSpecification) => {
    const { globalTimeZone, receivedTimeZone } = get();

    if (format)
      return moment
        .tz(time as string, format, receivedTimeZone)
        .tz(globalTimeZone);
    return moment.tz(time, receivedTimeZone).tz(globalTimeZone);
  },

  localMoment: (time?: TimeType, format?: moment.MomentFormatSpecification) => {
    const { globalTimeZone } = get();

    if (format) return moment.tz(time as string, format, globalTimeZone);
    return moment.tz(time, globalTimeZone);
  },

  toGlobalTime: (time: TimeType, format?: moment.MomentFormatSpecification) => {
    const { globalTimeZone, receivedTimeZone } = get();
    if (format)
      return moment
        .tz(time as string, format, globalTimeZone)
        .tz(receivedTimeZone);
    return moment.tz(time, globalTimeZone).tz(receivedTimeZone);
  },
}));

export default useTimeStore;
