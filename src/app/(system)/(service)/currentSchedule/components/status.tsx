import WarningIcon from "~/icons/WarnningIcon.svg";
interface StatusOfCurrentScheduleProps {
  status: string;
  isShowWarning?: boolean;
}
const StatusOfCurrentSchedule = (props: StatusOfCurrentScheduleProps) => {
  const { status, isShowWarning } = props;
  return (
    <div className="flex items-center gap-[44px] h-10">
      <div className="text-[#EB1DB2] font-[450] text-[18px]">{status}</div>

      {isShowWarning && (
        <div className="flex items-center gap-[9px] w-[340px] h-10 px-[20px] bg-[rgba(245,95,78,0.1)] rounded-[20px]">
          <WarningIcon width="16px" height="16px" color="#F5894E"></WarningIcon>
          <span className="text-[#F5894E] font-[390] text-[16px]">
            This schedule has unpublished shifts.
          </span>
        </div>
      )}
    </div>
  );
};

export default StatusOfCurrentSchedule;
