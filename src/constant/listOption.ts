import {
  ADMIN_USER_STATUS,
  COMPANIES_STATUS,
  EXCEPTION_REASON,
  NEED_HELP_SHIFT_STATUS,
  NEED_HELP_SHIFT_STATUS_UFG,
} from "./statusConstants";

export const YES_NO_LIST = [
  {
    label: "Yes",
    value: "Yes",
  },
  {
    label: "No",
    value: "No",
  },
];

export const WEEK_DATA_FOR_SELECT = [
  {
    label: "Sunday",
    value: "SUNDAY",
  },
  {
    label: "Monday",
    value: "MONDAY",
  },
  {
    label: "Tuesday",
    value: "TUESDAY",
  },
  {
    label: "Wednesday",
    value: "WEDNESDAY",
  },
  {
    label: "Thursday",
    value: "THURSDAY",
  },
  {
    label: "Friday",
    value: "FRIDAY",
  },
  {
    label: "Saturday",
    value: "SATURDAY",
  },
];

export const HPPD_TYPE = [
  {
    label: "Planned HPPD",
    value: "plannedHPPD",
  },
  {
    label: "Assigned HPPD",
    value: "assignedHPPD",
  },
];

export const getNumberOfWeek = (value: string) => {
  switch (value) {
    case "SUNDAY":
      return 7;
    case "MONDAY":
      return 1;
    case "TUESDAY":
      return 2;
    case "WEDNESDAY":
      return 3;
    case "THURSDAY":
      return 4;
    case "FRIDAY":
      return 5;
    case "SATURDAY":
      return 6;
    default:
      return 7;
  }
};

export const getAdminUserListOptions = () => {
  let options: {
    label: string;
    value: string;
  }[] = [];

  Object.keys(ADMIN_USER_STATUS).forEach((key: any) => {
    options.push({
      label: ADMIN_USER_STATUS[key as keyof typeof ADMIN_USER_STATUS],
      value: key,
    });
  });

  options = options.sort((a, b) => {
    return a.label.localeCompare(b.label);
  });

  return options;
};

export const getAdminUserListOptionsPending = () => {
  let options: {
    label: string;
    value: string;
  }[] = [];

  Object.keys(ADMIN_USER_STATUS).forEach((key: any) => {
    if (key === "3" || key === "4") {
      options.push({
        label: ADMIN_USER_STATUS[key as keyof typeof ADMIN_USER_STATUS],
        value: key,
      });
    }
  });

  options = options.sort((a, b) => {
    return a.label.localeCompare(b.label);
  });

  return options;
};

export const getNeedHelpShiftStatusOptions = ({ type }: { type: string }) => {
  let options: {
    label: string;
    value: string;
  }[] = [];

  if (type === "upForGrabs") {
    Object.keys(NEED_HELP_SHIFT_STATUS_UFG).forEach((key: any) => {
      options.push({
        label:
          NEED_HELP_SHIFT_STATUS_UFG[
            key as keyof typeof NEED_HELP_SHIFT_STATUS_UFG
          ],
        value: key,
      });
    });
  } else {
    Object.keys(NEED_HELP_SHIFT_STATUS).forEach((key: any) => {
      options.push({
        label:
          NEED_HELP_SHIFT_STATUS[key as keyof typeof NEED_HELP_SHIFT_STATUS],
        value: key,
      });
    });
  }

  options = options.sort((a, b) => {
    return a.label.localeCompare(b.label);
  });

  return options;
};

export const getExceptionReasonOptions = () => {
  let options: {
    label: string;
    value: string;
  }[] = [];
  const whiteList = ["CHECKED_IN", "CHECKED_OUT", "NOT_CHECKED_IN"];
  Object.keys(EXCEPTION_REASON).forEach((key: any) => {
    const label = EXCEPTION_REASON[key as keyof typeof EXCEPTION_REASON];
    if (whiteList.includes(key)) return;
    options.push({
      label,
      value: key,
    });
  });
  options = options.sort((a, b) => {
    let first = a.label.toLocaleLowerCase();
    let second = b.label.toLocaleLowerCase();
    return first.localeCompare(second);
  });
  return options;
};

export const getCompaniesStatusOptions = () => {
  let options: {
    label: string;
    value: string;
  }[] = [];

  Object.keys(COMPANIES_STATUS).forEach((key: any) => {
    options.push({
      label: COMPANIES_STATUS[key as keyof typeof COMPANIES_STATUS],
      value: key,
    });
  });

  options = options.sort((a, b) => {
    return a.label.localeCompare(b.label);
  });

  return options;
};
