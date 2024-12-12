import { memo } from "react";

import Tooltip from "@/components/custom/Tooltip";
import SixteenHoursIcon from "~/icons/shiftStatus/16hoursIcon.svg";
import DoubleBookedIcon from "~/icons/shiftStatus/DoubleBookedIcon.svg";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";
import PendingApprovalIcon from "~/icons/shiftStatus/PendingApprovalIcon.svg";
import RejectedIcon from "~/icons/shiftStatus/RejectedIcon.svg";
import TargetExceededIcon from "~/icons/shiftStatus/TargetExceededIcon.svg";

const DailyStatusIcon = (props: {
  tags: number[];
  onClick?: (tag: number) => void;
}) => {
  const { tags, onClick } = props;

  return (
    <div className="flex flex-nowrap gap-[10px] mx-2">
      {tags.includes(3) && (
        <Tooltip content={"Overtime"}>
          <OvertimeIcon
            width="16px"
            height="16px"
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClick) {
                onClick(3);
              }
            }}
          ></OvertimeIcon>
        </Tooltip>
      )}
      {tags.includes(5) && (
        <Tooltip content={"Overtime Rejected"}>
          <RejectedIcon
            width="16px"
            height="16px"
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClick) {
                onClick(6);
              }
            }}
          ></RejectedIcon>
        </Tooltip>
      )}
      {tags.includes(4) && (
        <Tooltip content={"Pending Approval"}>
          <PendingApprovalIcon
            width="16px"
            height="16px"
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClick) {
                onClick(4);
              }
            }}
          ></PendingApprovalIcon>
        </Tooltip>
      )}
      {tags.includes(2) && (
        <Tooltip content={"Work over 16 hours in a row"}>
          <SixteenHoursIcon
            width="16px"
            height="16px"
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClick) {
                onClick(2);
              }
            }}
          ></SixteenHoursIcon>
        </Tooltip>
      )}
      {tags.includes(1) && (
        <Tooltip content={"Double-Booked"}>
          <DoubleBookedIcon
            width="16px"
            height="16px"
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClick) {
                onClick(1);
              }
            }}
          ></DoubleBookedIcon>
        </Tooltip>
      )}
      {tags.includes(6) && (
        <Tooltip content={"Target Working Hours Exceeded"}>
          <TargetExceededIcon
            width="16px"
            height="16px"
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClick) {
                onClick(6);
              }
            }}
          ></TargetExceededIcon>
        </Tooltip>
      )}
    </div>
  );
};

export default memo(DailyStatusIcon);
