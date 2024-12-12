import { isAfter, isBefore, parse } from "date-fns";
import moment from "moment";

export function checkShiftsConflict(first: string[], last: string[]): boolean {
  const referenceDate = new Date();

  const start = parse(first[0], "hh:mm a", referenceDate);
  const end = parse(first[1], "hh:mm a", referenceDate);

  const shiftStart = parse(last[0], "hh:mm a", referenceDate);
  const shiftEnd = parse(last[1], "hh:mm a", referenceDate);

  if (isBefore(start, shiftEnd) && isAfter(end, shiftStart)) {
    return true;
  }

  return false;
}

export function convertUTCtoLocalDateTime(utcDateString: string): string {
  if (!utcDateString) return "";
  const utcDate = new Date(utcDateString);
  const localDate = new Date(
    utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
  );
  const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
  const day = localDate.getDate().toString().padStart(2, "0");
  const year = localDate.getFullYear().toString();
  const hours = (localDate.getHours() % 12 || 12).toString().padStart(2, "0");
  const minutes = localDate.getMinutes().toString().padStart(2, "0");
  const period = localDate.getHours() < 12 ? "AM" : "PM";

  return `${month}/${day}/${year} ${hours}:${minutes} ${period}`;
}

export const setLocalDateTime = (utcDateString: string): string => {
  const date = moment(utcDateString);
  const today = moment();
  const isYesterday = date.isSame(today.clone().subtract(1, "day"), "day");

  const isToday = date.isSame(today, "day");

  if (isYesterday) {
    return "Yesterday " + date.format("HH:mm");
  }

  if (isToday) {
    return date.format("HH:mm");
  }

  return date.format("MM/DD/YYYY HH:mm");
};

export const convert12to24 = (times: string) => {
  if (typeof times === "undefined" || times === null || times === "") {
    return;
  }
  let period = "am";
  if (times.toLowerCase().endsWith("pm")) {
    period = "pm";
  }

  const hour12 = times
    .replace("+", "")
    .replace(" ", "")
    .replace("am", "")
    .replace("pm", "")
    .replace("AM", "")
    .replace("PM", "")
    .split(":")[0];
  const minute = times
    .replace("+", "")
    .replace(" ", "")
    .replace("am", "")
    .replace("pm", "")
    .replace("AM", "")
    .replace("PM", "")
    .split(":")[1];

  let hour24 = parseInt(hour12, 10);
  if (period.toLowerCase() === "pm" && hour12 !== "12") {
    hour24 += 12;
  }
  if (period.toLowerCase() === "am" && hour12 === "12") {
    hour24 = 0;
  }

  const time =
    hour24.toString().padStart(2, "0") +
    ":" +
    minute.toString().padStart(2, "0") +
    ":" +
    "00";
  return time;
};
