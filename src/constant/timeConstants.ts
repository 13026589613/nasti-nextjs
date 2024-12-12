export const WEEK_LIST = {
  1: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  2: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"],
  3: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"],
  4: ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"],
  5: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
  6: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  0: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export type WeekListType = typeof WEEK_LIST;

export const TIME_FORMAT = {
  DATE_FORMAT: "MM/DD/YYYY",
  DATE_FORMAT_2: "YYYY-MM-DD",
  DATE_TIME_FORMAT: "MM/DD/YYYY hh:mm A",
  TIME_FORMAT: "hh:mm A",
};
