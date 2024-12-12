import { WeeklyDaysType } from "@/components/schedules/types/weekly";
import { cn } from "@/lib/utils";

interface ViewContainerProps {
  className?: string;
  weeklyDays: WeeklyDaysType[];
  children: (value: WeeklyDaysType) => React.ReactNode;
}

const ViewContainer = (props: ViewContainerProps) => {
  const { className, weeklyDays, children } = props;

  return (
    <div
      className={cn(
        "flex items-center h-[67px] pl-[100px] bg-background",
        className
      )}
    >
      {weeklyDays.map(({ dayOfWeek, dayOfWeekName, date }) => {
        return (
          <div
            key={date || dayOfWeek}
            className={cn("flex justify-center")}
            style={{
              width: "calc(100% / 7)",
              minWidth: "calc(100% / 7)",
              maxWidth: "calc(100% / 7)",
            }}
          >
            {children({ dayOfWeek, dayOfWeekName, date })}
          </div>
        );
      })}
    </div>
  );
};

export default ViewContainer;
