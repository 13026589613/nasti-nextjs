import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import FormItemLabel from "@/components/custom/FormItemLabel";
import Tooltip from "@/components/custom/Tooltip";
import { cn } from "@/lib/utils";
import useDepartmentStore from "@/store/useDepartmentStore";
import events from "@/utils/event";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";

import { NeedHelpShiftTabsKey } from "../page";
import { NeedHelpShift, NeedHelpShiftStatusVo } from "../types";
import { isOverTime } from "../utils";
import ChatIcon from "./ChatIcon";
interface ShiftInfoProps {
  currentView: NeedHelpShiftTabsKey;
  needHelpShift: NeedHelpShift;
  messageClick?: () => void;
  setData?: (data: any) => void;
}
const ShiftInfo = (props: ShiftInfoProps) => {
  const { setData, needHelpShift, currentView } = props;

  const pathname = usePathname();

  const { setDepartment } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const showProposerView = ["shiftSwaps", "upForGrabs", "callOffs"].includes(
    currentView
  );
  const showEmployee = ["overtimeShifts"].includes(currentView);
  const showScheduleWeek = ["overtimeShifts"].includes(currentView);
  const showNotes = [
    "shiftSwaps",
    "upForGrabs",
    "callOffs",
    "openShiftClaims",
    "overtimeShifts",
  ].includes(currentView);
  const showReasonView = ["callOffs"].includes(currentView);

  const showPartialShift = ["upForGrabs"].includes(currentView);

  const showPhone = [
    "shiftSwaps",
    "upForGrabs",
    "callOffs",
    "openShiftClaims",
    "overtimeShifts",
  ].includes(currentView);

  const showClaimedBy = ["openShiftClaims"].includes(currentView);

  function convertDateFormat(dateString: string): string {
    const dateParts = dateString.split("-");
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    return `${month}/${day}/${year}`;
  }
  const clickScheduleLink = () => {
    setDepartment([needHelpShift.departmentId], pathname);
    if (setData) {
      const { scheduleStartDate, scheduleEndDate, departmentId } =
        needHelpShift;
      setData({
        departmentId,
        startDate: convertDateFormat(scheduleStartDate || ""),
        endDate: convertDateFormat(scheduleEndDate || ""),
      });
      events.emit("set-header-select-disable", true);
    }
  };

  return (
    <div className="w-full mt-4">
      <div className="flex items-center">
        <div className="w-[100px] text-[18px] font-[450] leading-10">
          Status
        </div>
        <Status status={needHelpShift.status}></Status>
      </div>
      <div className="flex flex-wrap justify-between w-full">
        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label={"Department"}>
            <div className="min-h-10 text-[#919FB4]">
              {needHelpShift?.departmentName}
            </div>
          </FormItemLabel>
        </div>
        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label={"Location"}>
            <div className="min-h-10 text-[#919FB4]">
              {needHelpShift?.locationName}
            </div>
          </FormItemLabel>
        </div>
        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label={"Role"}>
            <div className="min-h-10 text-[#919FB4]">
              {needHelpShift?.roleName}
            </div>
          </FormItemLabel>
        </div>
        {showEmployee && (
          <div className="w-[calc(50%-10px)]">
            <FormItemLabel label={"Employee"}>
              <div className="min-h-10 text-[#919FB4] flex items-center gap-4">
                <span>{needHelpShift?.employee}</span>
                <ChatIcon targetUserId={needHelpShift.employeeId} />
              </div>
            </FormItemLabel>
          </div>
        )}
        {showProposerView && (
          <div className="w-[calc(50%-10px)]">
            <FormItemLabel label={"Proposer"}>
              <div className="min-h-10 text-[#919FB4] flex items-center gap-4">
                <span>{needHelpShift?.proposer}</span>
                <ChatIcon targetUserId={needHelpShift.proposerId} />
                {isOverTime(needHelpShift.tags || null) && (
                  <Tooltip content={"Overtime"}>
                    <OvertimeIcon className="w-4 h-4"></OvertimeIcon>
                  </Tooltip>
                )}
              </div>
            </FormItemLabel>
          </div>
        )}

        {showClaimedBy && (
          <div className="w-[calc(50%-10px)]">
            <FormItemLabel label={"Claimed by"}>
              <div className="min-h-10 text-[#919FB4] flex items-center gap-4">
                <span>{needHelpShift?.claimedBy}</span>
                <ChatIcon targetUserId={needHelpShift.claimUserId as string} />
              </div>
            </FormItemLabel>
          </div>
        )}

        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label={"Shift Date Time"}>
            <div className="min-h-10 text-[#919FB4]">
              {`${needHelpShift.shiftStartTime} - ${needHelpShift.shiftEndTime}`}
            </div>
          </FormItemLabel>
        </div>

        {showPhone && (
          <div className="w-[calc(50%-10px)]">
            <FormItemLabel label={"Phone Number"}>
              <div className="min-h-10 text-[#919FB4]">
                {needHelpShift.nationalPhone || "--"}
              </div>
            </FormItemLabel>
          </div>
        )}

        {showPartialShift && (
          <>
            <div className="w-[calc(50%-10px)]">
              <FormItemLabel label={"Partial Shift"}>
                <div className="min-h-10 text-[#919FB4]">
                  {needHelpShift.partialShift}
                </div>
              </FormItemLabel>
            </div>
            {needHelpShift.partialShift === "Yes" && (
              <div className="w-[calc(50%-10px)]">
                <FormItemLabel label={"Shift Time Needing Coverage"}>
                  <div className="min-h-10 text-[#919FB4]">{` ${needHelpShift.coverageStartTime} - ${needHelpShift.coverageEndTime}`}</div>
                </FormItemLabel>
              </div>
            )}
          </>
        )}
        {showScheduleWeek && (
          <div className="w-full">
            <FormItemLabel label={"Schedule Week"}>
              <span
                onClick={clickScheduleLink}
                className="underline cursor-pointer text-primary min-h-10 text-[#919FB4]"
              >
                {needHelpShift.scheduleWeek}
              </span>
            </FormItemLabel>
          </div>
        )}
        {showNotes && (
          <div className="w-full">
            <FormItemLabel label={"Notes"}>
              <div className="min-h-10 text-[#919FB4]">
                {needHelpShift.note}
              </div>
            </FormItemLabel>
          </div>
        )}

        {showReasonView && (
          <div className="w-full">
            <FormItemLabel label={"Reason for the call-off"}>
              <div className="min-h-10 text-[#919FB4]">
                {needHelpShift.reason}
              </div>
            </FormItemLabel>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftInfo;

const Status = (props: { status: NeedHelpShiftStatusVo }) => {
  const { status } = props;
  const statusColor = {
    APPROVED: {
      background: "bg-[#46DB7A1A]",
      text: "text-[#46DB7A]",
      border: "border-[#46DB7A]",
      message: "Approved",
    },
    APPROVE: {
      background: "bg-[#46DB7A1A]",
      text: "text-[#46DB7A]",
      border: "border-[#46DB7A]",
      message: "Approved",
    },
    REJECTED: {
      background: "bg-[#F55F4E1A]",
      text: "text-[#F55F4E]",
      border: "border-[#F55F4E]",
      message: "Rejected",
    },
    REJECT: {
      background: "bg-[#F55F4E1A]",
      text: "text-[#F55F4E]",
      border: "border-[#F55F4E]",
      message: "Rejected",
    },
    NEW: {
      background: "bg-[#9747FF14]",
      text: "text-[#9747FFC2]",
      border: "border-[#9747FFA3]",
      message: "Pending Approval",
    },
    PENDING: {
      background: "bg-[#9747FF14]",
      text: "text-[#9747FFC2]",
      border: "border-[#9747FFA3]",
      message: "Pending Approval",
    },
    PENDING_APPROVAL: {
      background: "bg-[#9747FF14]",
      text: "text-[#9747FFC2]",
      border: "border-[#9747FFA3]",
      message: "Pending Approval",
    },
    REQUESTED: {
      background: "bg-[#F2F8CA]",
      text: "text-[#A0D911]",
      border: "border-[#DAEF7F]",
      message: "Requested",
    },
  };

  return (
    <div
      className={cn(
        "flex items-center w-fit h-6 rounded-[12px] px-3 border border-dashed",
        statusColor[status].background,
        statusColor[status].text,
        statusColor[status].border
      )}
    >
      <span>{statusColor[status].message}</span>
    </div>
  );
};
