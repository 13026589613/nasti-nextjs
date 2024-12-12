import React from "react";

import CustomButton from "@/components/custom/Button";
import PageTitle from "@/components/PageTitle";

import ShiftHistory from "../../../currentSchedule/components/ShiftHistory";
import { NeedHelpShift } from "../../types";
import DetailLayout from "../DetailLayout";
import ShiftInfo from "../ShiftInfo";

export interface ReviewNeedHelpShiftProps {
  needHelpShift: NeedHelpShift;
  onClose?: () => void;
}

const ViewOpenShift = (props: ReviewNeedHelpShiftProps) => {
  const { needHelpShift, onClose } = props;

  return (
    <DetailLayout
      footerRender={
        <CustomButton
          onClick={onClose}
          variant={"outline"}
          className="w-[110px]"
        >
          Cancel
        </CustomButton>
      }
    >
      <PageTitle title="Shift Details" isClose={false} />
      <ShiftInfo
        currentView={"openShiftClaims"}
        needHelpShift={needHelpShift}
      ></ShiftInfo>
      <ShiftHistory shiftId={needHelpShift.shiftId || ""}></ShiftHistory>
    </DetailLayout>
  );
};

export default ViewOpenShift;
