import { WEEK_LIST } from "@/constant/timeConstants";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";

const Header = () => {
  const { startOfWeek } = useGlobalCommunityId();
  const { localMoment } = useGlobalTime();
  const weeklyDays = WEEK_LIST[startOfWeek as keyof typeof WEEK_LIST];

  return (
    <div className="h-[52px] flex bg-[#F2F5FD]">
      {weeklyDays.map((day) => {
        const isCurrent = localMoment().format("ddd") === day;
        return (
          <div
            key={day}
            className={cn(
              "flex-1 flex items-center justify-center h-full w-[100px]",
              isCurrent && "text-primary"
            )}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
};

export default Header;
