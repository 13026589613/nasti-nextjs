import { NeedHelpShiftStatusVo } from "./types";
// overtime list item can`t be selected if it`s status is included in this status list
export const isCanNotCheck = (status: NeedHelpShiftStatusVo) =>
  ["APPROVED", "REJECTED", "APPROVE", "REJECT"].includes(status);

export const isOverTime = (tags: Array<string | number> | null) =>
  tags &&
  Array.isArray(tags) &&
  [3, "WEEK_OUTWEIGH_40"].some((tag) => tags.includes(tag));
