import { cn } from "@/lib/utils";

import { NeedHelpShiftStatusVo } from "../types";
const NeedHelpShiftStatus = ({ status }: { status: NeedHelpShiftStatusVo }) => {
  const statusColor = {
    APPROVE: "bg-[#46DB7A1A]",
    APPROVED: "bg-[#46DB7A1A]",
    REJECTED: "bg-[#F55F4E1A]",
    PENDING: "bg-[#99FFF999]",
    PENDING_APPROVAL: "bg-[#99FFF999]",
    NEW: "bg-[#99FFF999]",
    REJECT: "bg-[#F55F4E1A]",
    REQUESTED: "bg-[#FFFBE6]",
  };

  const statusText = {
    APPROVE: "Approved",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    REJECT: "Rejected",
    PENDING: "Pending Approval",
    PENDING_APPROVAL: "Pending Approval",
    NEW: "Pending Approval",
    REQUESTED: "Requested",
  };

  return (
    <div
      className={cn(
        "flex items-center w-fit h-[28px] rounded-[14px] px-[10px] text-[16px] font-[390] text-[#919FB4] leading-[28px] whitespace-nowrap",
        statusColor[status]
      )}
    >
      {statusText[status]}
    </div>
  );
};

export default NeedHelpShiftStatus;
