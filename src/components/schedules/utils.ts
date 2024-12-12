import { ScheduleShift } from "@/api/currentSchedule/types";
import useTimeStore from "@/store/useTimeStore";
type DateType = Date | string;

export const formatDate = (
  date: DateType,
  formatStr: string,
  dateFormat: string
) => {
  return useTimeStore
    .getState()
    .localMoment(date, dateFormat)
    .format(formatStr);
};

export const getDateString = (time: DateType, dateFormat: string) =>
  formatDate(time, "MM/DD/YYYY", dateFormat);

export const getMonthlyString = (time: DateType, dateFormat: string) =>
  formatDate(time, "MM/YYYY", dateFormat);

export const getDateTimeString = (time: DateType, dateFormat: string) =>
  formatDate(time, "MM/DD/YYYY HH:mm", dateFormat);

export const getDateObject = (time: DateType, dateFormat: string) => ({
  year: formatDate(time, "YYYY", dateFormat),
  month: formatDate(time, "MM", dateFormat),
  date: formatDate(time, "DD", dateFormat),
});

export const getTimeObject = (time: DateType, dateFormat: string) => ({
  hour: formatDate(time, "HH", dateFormat),
  minute: formatDate(time, "mm", dateFormat),
});

export const sortStartWeek = (
  startOfWeek: string,
  shiftTimes: { dayOfWeek: number }[]
) => {
  if (!startOfWeek) return shiftTimes;

  const daysMap: {
    [key: string]: number;
  } = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
  };

  const startDay = daysMap[startOfWeek] || 1;
  const newShiftTimes = [...shiftTimes];
  return newShiftTimes.sort((a, b) => {
    const diffA = (a.dayOfWeek - startDay + 7) % 7;
    const diffB = (b.dayOfWeek - startDay + 7) % 7;
    // Manage case when sort is equal (diffA === diffB)
    if (diffA - diffB === 0) {
      return a.dayOfWeek - b.dayOfWeek;
    }
    return diffA - diffB;
  });
};

export const handleTimeToDateTime = (
  startTime: string,
  endTime: string,
  dateFormat: string
) => {
  const startDate = useTimeStore.getState().localMoment(startTime, dateFormat);

  let endDate = useTimeStore.getState().localMoment(endTime, dateFormat);

  if (endDate.isSameOrBefore(startDate)) {
    endDate = endDate.add(1, "day");
  }

  return {
    startTime: getDateTimeString(startDate.format("x"), "x"),
    endTime: getDateTimeString(endDate.format("x"), "x"),
  };
};

export const getMonthlyDays = (
  monthlyDate: string,
  format: string,
  weekStartsOn: number
) => {
  // parse date
  const parsedDate = useTimeStore.getState().localMoment(monthlyDate, format);

  // Get the start and end dates of the month
  const startOfMonth = parsedDate.clone().startOf("month");
  const endOfMonth = parsedDate.clone().endOf("month");

  // Get the entire week with the start and end dates of the month based on the global week start date
  const startDateOfMonth = startOfMonth
    .clone()
    .startOf("week")
    .add(weekStartsOn, "days");
  const endDateOfMonth = endOfMonth
    .clone()
    .endOf("week")
    .add(weekStartsOn, "days");

  // Get each day in the interval
  const monthlyDays: Array<{ day: string; month: string }> = [];
  const currentDay = startDateOfMonth.clone();

  while (currentDay.isSameOrBefore(endDateOfMonth)) {
    monthlyDays.push({
      day: currentDay.format("YYYY-MM-DD"),
      month: currentDay.format("MM"),
    });
    currentDay.add(1, "day");
  }

  return monthlyDays;
};

export const getWeekDays = (
  startDate: string,
  endDate: string,
  format: string
) => {
  const start = useTimeStore.getState().localMoment(startDate, format);
  const end = useTimeStore.getState().localMoment(endDate, format);

  const days = [];
  const current = start.clone();

  while (current.isSameOrBefore(end)) {
    days.push(current.format(format));
    current.add(1, "day");
  }

  return days;
};

export const getWeekDates = (dateString: string, dateFormat: string) => {
  const dates = [];
  const startOfWeek = useTimeStore
    .getState()
    .localMoment(dateString, dateFormat)
    .startOf("week");

  for (let i = 0; i < 7; i++) {
    dates.push(startOfWeek.clone().add(i, "days").format("MM/DD/YYYY"));
  }

  return dates;
};

export const getStartAndEndOfWeek = (
  dateString: string,
  dateFormat: string
) => {
  const startOfWeek = useTimeStore
    .getState()
    .localMoment(dateString, dateFormat)
    .startOf("week");
  const endOfWeek = useTimeStore
    .getState()
    .localMoment(dateString, dateFormat)
    .endOf("week");

  return {
    startOfWeek: startOfWeek.format("MM/DD/YYYY"),
    startTime: startOfWeek.format("x"),
    endOfWeek: endOfWeek.format("MM/DD/YYYY"),
    endTime: endOfWeek.format("x"),
  };
};

export function getDaysInterval({
  start,
  end,
  dateFormat,
}: {
  start: string | Date;
  end: string | Date;
  dateFormat?: string;
}) {
  let startDate = useTimeStore.getState().localMoment(start, dateFormat);
  const endDate = useTimeStore.getState().localMoment(end, dateFormat);
  let daysArray = [];

  while (startDate.isSameOrBefore(endDate)) {
    daysArray.push(startDate.toDate());
    startDate = startDate.clone().add(1, "days");
  }

  return daysArray;
}

export const isRedBg = (
  shift: ScheduleShift,
  isShowAttendeeStatus: boolean
) => {
  const { attendeeStatus, isPublished, userName } = shift;

  if (isPublished && userName) {
    return ["NOT_CHECKED_IN", "NO_SHOW"].includes(attendeeStatus);
  } else {
    return false;
  }
};
