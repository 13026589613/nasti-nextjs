export const ADMIN_USER_STATUS = {
  0: "Inactive",
  1: "Active",
  2: "Pending Approval",
  3: "Invitation Sent",
  4: "Invitation Not Sent",
};

export const ADMIN_USER_STATUS_PENDING = {
  3: "Invitation Sent",
  4: "Invitation Not Sent",
};

export const ADMIN_USER_STATUS_COLOR = {
  0: "bg-[#F55F4E1A]",
  1: "bg-[#46DB7A1A]",
  2: "bg-[#99FFF999]",
  3: "bg-[#4EBBF51A]",
  4: "bg-[#9747FF33]",
};

export const SUPER_ADMIN_USER_STATUS = {
  0: "Inactive",
  1: "Active",
  3: "Invitation Sent",
};

export const SUPER_ADMIN_USER_STATUS_COLOR = {
  0: "bg-[#F55F4E1A]",
  1: "bg-[#46DB7A1A]",
  3: "bg-[#4EBBF51A]",
};

export const CAN_SEND_EMAIL_STATUS = [3, 4];

export const NEED_HELP_SHIFT_STATUS = {
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const NEED_HELP_SHIFT_STATUS_UFG = {
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REQUESTED: "Requested",
};

export const NEED_HELP_SHIFT_STATUS_VALUE = {
  PENDING: "NEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECT",
};

export const EXCEPTION_REASON = {
  NO_SHOW: "No Show",
  CHECKED_IN: "Checked In",
  LATE_CHECK_IN: "Late Check In",
  NOT_CHECKED_IN: "Not Checked In",
  CHECKED_OUT: "Checked Out",
  EARLY_CHECK_OUT: "Early Check Out",
  LATE_CHECK_OUT: "Late Check Out",
  LATE_CHECK_OUT_ONGOING: "Late Check Out - Ongoing",
  LEFT_WITHOUT_CHECKING_OUT: "Left without Checking Out",
  BREAK_TIME_EXCEPTION: "Break Time Exception",
};

export const COMPANIES_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};
