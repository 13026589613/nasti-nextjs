import { memo } from "react";

// import { useShallow } from "zustand/react/shallow";
import Tooltip from "@/components/custom/Tooltip";
// import useAuthStore from "@/store/useAuthStore";
import SixteenHoursIcon from "~/icons/shiftStatus/16hoursIcon.svg";
import DoubleBookedIcon from "~/icons/shiftStatus/DoubleBookedIcon.svg";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";
import PendingApprovalIcon from "~/icons/shiftStatus/PendingApprovalIcon.svg";
import RejectedIcon from "~/icons/shiftStatus/RejectedIcon.svg";
import TargetExceededIcon from "~/icons/shiftStatus/TargetExceededIcon.svg";

const WeeklyStatusIcon = (props: {
  tags: number[];
  onClick?: (tag: number) => void;
}) => {
  const { tags, onClick } = props;

  // const { permission } = useAuthStore(
  //   useShallow((state) => ({
  //     ...state,
  //   }))
  // );

  return (
    <div>
      {tags.includes(3) && (
        <div className="flex items-center justify-center w-6 h-4 mb-[4px] shadow-[0px_4px_4px_-1px_#0C0C0D0D]">
          <Tooltip content={"Overtime"}>
            <OvertimeIcon
              width="12px"
              height="12px"
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                if (onClick) {
                  onClick(3);
                }
              }}
            ></OvertimeIcon>
          </Tooltip>
        </div>
      )}
      {tags.includes(4) && (
        <div className="flex items-center justify-center w-6 h-4 mb-[4px] shadow-[0px_4px_4px_-1px_#0C0C0D0D]">
          <Tooltip content={"Pending Approval"}>
            <PendingApprovalIcon
              width="12px"
              height="12px"
              onClick={(e: any) => {
                // e.preventDefault();
                // e.stopPropagation();
                // if (
                //   onClick &&
                //   permission.includes("SCHEDULE_MANAGEMENT_APPROVE_OVERTIME")
                // ) {
                //   onClick(4);
                // }
              }}
            ></PendingApprovalIcon>
          </Tooltip>
        </div>
      )}
      {tags.includes(5) && (
        <div className="flex items-center justify-center w-6 h-4 mb-[4px] shadow-[0px_4px_4px_-1px_#0C0C0D0D]">
          <Tooltip content={"Overtime Rejected"}>
            <RejectedIcon
              width="12px"
              height="12px"
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                if (onClick) {
                  onClick(6);
                }
              }}
            ></RejectedIcon>
          </Tooltip>
        </div>
      )}
      {tags.includes(6) && (
        <div className="flex items-center justify-center w-6 h-4 mb-[4px] shadow-[0px_4px_4px_-1px_#0C0C0D0D]">
          <Tooltip content={"Target Working Hours Exceeded"}>
            <TargetExceededIcon
              width="12px"
              height="12px"
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                if (onClick) {
                  onClick(6);
                }
              }}
            ></TargetExceededIcon>
          </Tooltip>
        </div>
      )}
      {tags.includes(2) && (
        <div className="flex items-center justify-center w-6 h-4 mb-[4px] shadow-[0px_4px_4px_-1px_#0C0C0D0D]">
          <Tooltip content={"Work over 16 hours in a row"}>
            <SixteenHoursIcon
              width="12px"
              height="12px"
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                if (onClick) {
                  onClick(2);
                }
              }}
            ></SixteenHoursIcon>
          </Tooltip>
        </div>
      )}
      {tags.includes(1) && (
        <div className="flex items-center justify-center w-6 h-4 mb-[4px] rounded-[2px] shadow-[0px_4px_4px_-1px_rgba(12,12,13,0.1)] bg-[#fff]">
          <Tooltip content={"Double-Booked"}>
            <DoubleBookedIcon
              height="12px"
              width="12px"
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                if (onClick) {
                  onClick(1);
                }
              }}
            ></DoubleBookedIcon>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default memo(WeeklyStatusIcon);
