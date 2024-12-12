import { CommunityRuleCodeListResponse } from "@/app/(system)/(service)/community/create/scheduleRules/types";

export const getLabel = (
  code: string,
  codeList: CommunityRuleCodeListResponse
) => {
  return codeList.find((item) => item.code === code)?.name || null;
};

export const getDefaultValue = (
  type:
    | "OvertimeRules"
    | "OpenShiftRules"
    | "PartialShiftRules"
    | "SwapRules"
    | "UpforGrabsRules"
    | "CoffRules"
    | "SendToKareRules",
  codeList: CommunityRuleCodeListResponse
) => {
  let value = "";
  if (type === "OvertimeRules") {
    const list = [
      "NO_OVERTIME",
      "OT_LIMITED",
      "OT_APPROVAL_REQUIRED",
      "OT_NOTIFICATION_REQUIRED",
    ];
    codeList.forEach((item) => {
      if (list.includes(item.code) && item.default) {
        value = item.code;
      }
    });
  } else if (type === "OpenShiftRules") {
    const list = [
      "AUTO_APPROVE_QUALIFIED_SHIFT",
      "SCHEDULER_APPROVE_ALL_CLAIMED_SHIFTS",
    ];
    codeList.forEach((item) => {
      if (list.includes(item.code) && item.default) {
        value = item.code;
      }
    });
  } else if (type === "PartialShiftRules") {
    const list = ["NO_PARTIAL_SHIFTS", "ALLOW_PARTIAL_SHIFTS"];
    codeList.forEach((item) => {
      if (list.includes(item.code) && item.default) {
        value = item.code;
      }
    });
  } else if (type === "SwapRules") {
    const list = [
      "NO_SHIFT_SWAPS",
      "SCHEDULER_APPROVE_SWAPS",
      "AUTO_APPROVE_SWAPS",
    ];
    codeList.forEach((item) => {
      if (list.includes(item.code) && item.default) {
        value = item.code;
      }
    });
  } else if (type === "UpforGrabsRules") {
    const list = ["NO_COVERAGE", "APPROVE_COVERAGE", "AUTO_COVERAGE"];
    codeList.forEach((item) => {
      if (list.includes(item.code) && item.default) {
        value = item.code;
      }
    });
  } else if (type === "CoffRules") {
    const list = ["NO_CALL_OFF", "ALLOW_CALL_OFF_WITHIN_HOURS"];
    codeList.forEach((item) => {
      if (list.includes(item.code) && item.default) {
        value = item.code;
      }
    });
  } else if (type === "SendToKareRules") {
    const list = [
      "SCHEDULE_PUBLISHED",
      "SHIFT_OPEN_START_DAY",
      "MANUALLY_SHIFT_TO_KARE",
    ];
    codeList.forEach((item) => {
      if (list.includes(item.code) && item.default) {
        value = item.code;
      }
    });
  }
  return value;
};
