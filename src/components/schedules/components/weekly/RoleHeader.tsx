import Tooltip from "@/components/custom/Tooltip";
import { cn } from "@/lib/utils";

export interface DayData {
  dayOfWeek: number;
  dayOfWeekName: string;
  date?: string;
  role: {
    workerRoleId: string;
    workerRoleName: string;
    count: number;
    hours: number;
  }[];
}

interface HeaderProps {
  className?: string;
  weeklyDays: DayData[];
  showDayOfWeek?: boolean;
  currentDay?: string;
}

const Header = (props: HeaderProps) => {
  const { className, weeklyDays, currentDay } = props;

  return (
    <div
      className={cn(
        "flex items-center h-[52px] bg-[#f0f4fd] pl-[100px] text-[#324664]",
        className
      )}
    >
      {weeklyDays.map(({ dayOfWeek, dayOfWeekName, date, role }) => {
        const hasRole = role.length > 0;

        return (
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
            {hasRole ? (
              <Tooltip
                content={
                  <div className="flex flex-wrap gap-2 max-w-[40vw]">
                    {role.map((item, index) => {
                      const isLastItem = index === role.length - 1; // 判断是否是最后一个 role
                      const name =
                        item.count > 1
                          ? item.workerRoleName + "s"
                          : item.workerRoleName;
                      return (
                        <div key={index}>
                          {`${item.count} ${name} - ${item.hours.toFixed(
                            2
                          )} hours`}
                          {!isLastItem && ";"}
                        </div>
                      );
                    })}
                  </div>
                }
              >
                <div>{dayOfWeekName}</div>
              </Tooltip>
            ) : (
              <div>{dayOfWeekName}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Header;
