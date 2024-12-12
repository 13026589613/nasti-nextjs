import React from "react";
import { useState } from "react";

import ScheduleIndex from "@/app/(system)/(service)/currentSchedule/components";
import CustomButton from "@/components/custom/Button";
// import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import { useEventBus } from "@/utils/event";
import events from "@/utils/event";

import ShiftHistory from "../../../currentSchedule/components/ShiftHistory";
import { NeedHelpShiftTabsKey } from "../../page";
import { NeedHelpShift } from "../../types";
import DetailLayout from "../DetailLayout";
import ShiftInfo from "../ShiftInfo";
export interface ReviewNeedHelpShiftProps {
  type: NeedHelpShiftTabsKey;
  needHelpShift: NeedHelpShift;
  onClose?: () => void;
}

const ReviewSwapsShift = (props: ReviewNeedHelpShiftProps) => {
  const { type, needHelpShift, onClose } = props;
  const [scheduleDate, setScheduleDate] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  useEventBus("close-schedule", () => {
    setShowSchedule(false);
    events.emit("set-header-select-disable", false);
  });
  const setScheduleData = (data: any) => {
    const { startDate, endDate, departmentId } = data;
    if (startDate && endDate) {
      setShowSchedule(true);
      setScheduleDate({
        startDate,
        endDate,
      });
    }
    if (departmentId) events.emit("set-header-department-id", departmentId);
  };
  return (
    <>
      {showSchedule && (
        <div className="p-[15px]">
          <ScheduleIndex currentItem={scheduleDate} type={1}></ScheduleIndex>
        </div>
      )}
      {!showSchedule && (
        <DetailLayout
          footerRender={
            <div className="flex justify-end">
              <CustomButton
                onClick={onClose}
                variant={"outline"}
                className="w-[110px]"
              >
                Cancel
              </CustomButton>
            </div>
          }
        >
          <div>
            <div className="h-[81vh] overflow-y-auto">
              <PageTitle title="Shift Details" isClose={false} />
              <ShiftInfo
                currentView={type}
                needHelpShift={needHelpShift}
                setData={setScheduleData}
              ></ShiftInfo>
              {/* <ShiftHistory shiftId={needHelpShift.id}></ShiftHistory> */}
              <ShiftHistory
                shiftId={needHelpShift.shiftId || ""}
              ></ShiftHistory>
            </div>
          </div>
        </DetailLayout>
      )}
    </>
  );
};

export default ReviewSwapsShift;
