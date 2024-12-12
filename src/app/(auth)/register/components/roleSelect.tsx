import CareWorkersIcon from "~/icons/CareWorkersIcon.svg";
import ScheduleIcon from "~/icons/ScheduleIcon.svg";

export interface RoleSelectProps {
  role: boolean;
  setRole: (role: boolean) => void;
}
const RoleSelect = ({ role, setRole }: RoleSelectProps) => {
  return (
    <div className="absolute top-[50%] translate-y-[-50%] left-[56px]">
      <div className="flex justify-between gap-[30px] h-[303px]">
        <div
          onClick={() => {
            setRole(true);
          }}
          className="flex flex-col justify-center items-center gap-[41px] w-[303px] h-[303px] bg-[#4EBBF51A] cursor-pointer text-[#919FB4] hover:text-[#EB1DB2]"
        >
          <ScheduleIcon width="141px" height="141px" />
          <span className="txet-[24px]">Scheduler or Admin?</span>
        </div>
        <div className="flex flex-col justify-center items-center gap-[41px] w-[303px] h-[303px] bg-[#4EBBF51A] cursor-pointer text-[#919FB4] hover:text-[#EB1DB2]">
          <CareWorkersIcon width="141px" height="141px" />
          <span className="txet-[24px]">Worker at a Community?</span>
        </div>
      </div>
      <div className="absolute top-[-98px] left-[50%] translate-x-[-50%] leading-10 text-[16px] font-[400] text-[#324664]">
        Are you a
      </div>
    </div>
  );
};

export default RoleSelect;
