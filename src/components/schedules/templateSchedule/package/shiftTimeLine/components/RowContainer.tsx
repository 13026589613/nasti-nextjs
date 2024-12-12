import Tooltip from "@/components/custom/Tooltip";
import { cn } from "@/lib/utils";
import AddIcon from "~/icons/AddIcon.svg";

interface RowContainerProps {
  width: number;
  children: React.ReactNode;
  weeklyNameClassName?: string;
  weeklyName?: string;
  showAddShift?: boolean;
  tooltip?: {
    hour: number;
    role: string;
    roleId: string;
    count: number;
  }[];
  onAddShiftClick?: () => void;
}

const RowContainer = (props: RowContainerProps) => {
  const {
    width,
    children,
    weeklyName,
    weeklyNameClassName,
    showAddShift = true,
    tooltip,
    onAddShiftClick,
  } = props;

  return (
    <div
      className={cn(
        "flex justify-end",
        weeklyName && "border-b-[1px] border-b-[#E7EDF1]"
      )}
    >
      {weeklyName && (
        <div
          className={cn(
            "w-full flex flex-col justify-center items-center border-r-[1px] border-r-[#E7EDF1]",
            weeklyNameClassName
          )}
        >
          {(tooltip && tooltip.length > 0 && (
            <Tooltip
              content={
                <>
                  {
                    <div className="flex flex-wrap gap-2 max-w-[40vw]">
                      {tooltip.map((item, index) => {
                        const name =
                          item.count > 1 ? item.role + "s" : item.role;
                        return (
                          <div key={index}>
                            {index === tooltip.length - 1
                              ? `${item.count} ${name} - ${item.hour.toFixed(
                                  2
                                )} hours`
                              : `${item.count} ${name} - ${item.hour.toFixed(
                                  2
                                )} hours;`}
                          </div>
                        );
                      })}
                    </div>
                  }
                </>
              }
            >
              <div>{weeklyName}</div>
            </Tooltip>
          )) || <div>{weeklyName}</div>}
          <div className="cursor-pointer">
            {showAddShift && (
              <Tooltip content="Add shift">
                <AddIcon
                  width="12"
                  height="12"
                  color="#d838ae"
                  onClick={onAddShiftClick}
                />
              </Tooltip>
            )}
          </div>
        </div>
      )}

      <div
        className="min-h-[42px] relative border-t-[1px] border-t-[#F2F5FD] overflow-hidden"
        style={{
          width,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default RowContainer;
