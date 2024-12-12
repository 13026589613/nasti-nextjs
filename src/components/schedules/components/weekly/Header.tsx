import { WeeklyDaysType } from "@/components/schedules/types/weekly";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
  weeklyDays: WeeklyDaysType[];
  showDayOfWeek?: boolean;
  currentDay?: string;
}

const Header = (props: HeaderProps) => {
  const { className, weeklyDays, showDayOfWeek = false, currentDay } = props;

  return (
    <div
      className={cn(
        "flex items-center h-[52px] bg-[#f0f4fd] pl-[100px] text-[#324664]",
        className
      )}
    >
      {weeklyDays.map(({ dayOfWeek, dayOfWeekName, date }) => (
        <div
          key={dayOfWeek}
          className={cn("text-center", {
            "text-primary": date && currentDay === date,
          })}
          style={{
            width: "calc(100% / 7)",
            minWidth: "calc(100% / 7)",
            maxWidth: "calc(100% / 7)",
          }}
        >
          {showDayOfWeek && <div>{dayOfWeek}</div>}
          <div>{dayOfWeekName}</div>
        </div>
      ))}
    </div>
  );
};

export default Header;
