import "rc-picker/assets/index.css";
import "./style.sass";

import moment, { Moment } from "moment";
import { PickerPanel } from "rc-picker";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import en_US from "rc-picker/lib/locale/en_US";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import DatePickerIcon from "~/icons/DatePickerIcon.svg";
import LeftArrow2 from "~/icons/LeftArrow2.svg";
import RightArrow2 from "~/icons/RightArrow2.svg";

interface WeekPickerProps {
  className?: string;
  format?: string;
  formatValue?: string;

  startDate: string;
  endDate: string;

  disabledDate?: (current: Moment) => boolean;

  onChange: ({
    startDate,
    endDate,
  }: {
    startDate: string;
    endDate: string;
  }) => void;

  placeholder?: string;
}

const WeekPicker = (props: WeekPickerProps) => {
  const {
    className,
    format = "ddd, MMM D, YYYY",
    formatValue = "MM/DD/YYYY",
    startDate,
    endDate,
    onChange,
    placeholder = "Select Date",
    disabledDate,
  } = props;

  const { localMoment, globalTimeZone } = useGlobalTime();

  moment.tz.setDefault(globalTimeZone);

  const handlePreviousWeek = () => {
    const newStartDate = localMoment(startDate, formatValue)
      .subtract(1, "week")
      .startOf("week")
      .format(formatValue);
    const newEndDate = localMoment(endDate, formatValue)
      .subtract(1, "week")
      .endOf("week")
      .format(formatValue);
    onChange({ startDate: newStartDate, endDate: newEndDate });
  };

  const handleNextWeek = () => {
    const newStartDate = localMoment(startDate, formatValue)
      .add(1, "week")
      .startOf("week")
      .format(formatValue);
    const newEndDate = localMoment(endDate, formatValue)
      .add(1, "week")
      .endOf("week")
      .format(formatValue);
    onChange({ startDate: newStartDate, endDate: newEndDate });
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover>
        <div className="flex items-center border-[1px] border-[#E7EDF1]">
          <div
            onClick={handlePreviousWeek}
            className="cursor-pointer select-none w-[30px] h-[30px] flex justify-center items-center"
          >
            <LeftArrow2 />
          </div>
          <PopoverTrigger asChild>
            <div className="w-full h-[40px] flex items-center p-[0_15px] rounded-[4px] cursor-pointer">
              <div className="flex-1 text-center">
                <span>
                  {startDate
                    ? localMoment(startDate, formatValue).format(format)
                    : placeholder}
                </span>
                <span className="m-[0_5px]">~</span>
                <span>
                  {endDate
                    ? localMoment(endDate ?? new Date(), formatValue).format(
                        format
                      )
                    : placeholder}
                </span>
              </div>

              <DatePickerIcon width="20px" height="20px" color="#919FB4" />
            </div>
          </PopoverTrigger>
          <div
            onClick={handleNextWeek}
            className="cursor-pointer select-none w-[30px] h-[30px] flex justify-center items-center"
          >
            <RightArrow2 />
          </div>
        </div>

        <PopoverContent className="w-auto p-0">
          <div className="schedule-week-picker">
            <PickerPanel
              format={format}
              value={
                startDate ? localMoment(startDate, formatValue) : undefined
              }
              disabledDate={disabledDate}
              onChange={(date) => {
                const startDate = localMoment(date as Moment)
                  .startOf("week")
                  .format(formatValue);
                const endDate = localMoment(date as Moment)
                  .endOf("week")
                  .format(formatValue);

                onChange({
                  startDate,
                  endDate,
                });
              }}
              locale={en_US}
              generateConfig={momentGenerateConfig}
              picker="week"
              showWeek={false}
              showNow={true}
            />
          </div>
          <div
            onClick={() => {
              const startDate = localMoment()
                .startOf("week")
                .format(formatValue);
              const endDate = localMoment().endOf("week").format(formatValue);

              onChange({
                startDate,
                endDate,
              });
            }}
            className="h-[42px] w-full text-primary text-[16px] font-[400] text-center leading-[42px] border-t border-t-[#F0F0F0] cursor-pointer"
          >
            Today
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default WeekPicker;
