import { AttendeeStatus } from "@/api/currentSchedule/types";
import { EXCEPTION_REASON } from "@/constant/statusConstants";
import { cn } from "@/lib/utils";

const DailyAttendeeStatus = ({
  attendeeStatus,
}: {
  attendeeStatus: AttendeeStatus;
}) => {
  const status = {
    NO_SHOW: {
      text: EXCEPTION_REASON.NO_SHOW,
      font: "text-[#13C2C2] font-[700]",
    },
    CHECKED_IN: {
      text: EXCEPTION_REASON.CHECKED_IN,
      font: "text-[#46DB7A] font-[400]",
    },
    LATE_CHECK_IN: {
      text: EXCEPTION_REASON.LATE_CHECK_IN,
      font: "text-[#EB2F96] font-[700]",
    },
    NOT_CHECKED_IN: {
      text: EXCEPTION_REASON.NOT_CHECKED_IN,
      font: "text-[#F55F4E] font-[700]",
    },
    CHECKED_OUT: {
      text: EXCEPTION_REASON.CHECKED_OUT,
      font: "text-[#919FB4] font-[400]",
    },
    EARLY_CHECK_OUT: {
      text: EXCEPTION_REASON.EARLY_CHECK_OUT,
      font: "text-[#FF4874] font-[400]",
    },
    LATE_CHECK_OUT: {
      text: EXCEPTION_REASON.LATE_CHECK_OUT,
      font: "text-[#722ED1] font-[400]",
    },
    LATE_CHECK_OUT_ONGOING: {
      text: EXCEPTION_REASON.LATE_CHECK_OUT_ONGOING,
      font: "text-[#1890FF] font-[400]",
    },
    LEFT_WITHOUT_CHECKING_OUT: {
      text: EXCEPTION_REASON.LEFT_WITHOUT_CHECKING_OUT,
      font: "text-[#AD6602] font-[400]",
    },
    BREAK_TIME_EXCEPTION: {
      text: EXCEPTION_REASON.BREAK_TIME_EXCEPTION,
      font: "text-[#1132D9] font-[400]",
    },
  };
  return (
    <div className={cn("text-base", status[attendeeStatus]?.font)}>
      {status[attendeeStatus]?.text}
    </div>
  );
};

export default DailyAttendeeStatus;
