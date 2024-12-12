// for example: 08/07/2024 15:00:00 ---->   8/7/2024 3:00PM
export function convertTo12HourFormat(timeString: string): string {
  if (!timeString) return "";
  const date = new Date(timeString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formatMonthAndDay = (num: number) => (num > 9 ? num : `0${num}`);
  const formattedTime = `${formatMonthAndDay(
    date.getMonth() + 1
  )}/${formatMonthAndDay(
    date.getDate()
  )}/${date.getFullYear()} ${formattedHours}:${minutes
    .toString()
    .padStart(2, "0")}${" "}${ampm}`;

  return formattedTime;
}
