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

interface DayPickerProps {
  className?: string;
  format?: string;
  formatValue?: string;

  value: string | undefined;

  onChange: (value: string) => void;

  placeholder?: string;
}

const DayPicker = (props: DayPickerProps) => {
  const {
    className,
    format = "ddd, MMM D, YYYY",
    formatValue = "MM/DD/YYYY",
    value,
    onChange,
    placeholder = "Select Date",
  } = props;

  const { localMoment, globalTimeZone } = useGlobalTime();

  moment.tz.setDefault(globalTimeZone);

  const handlePreviousDay = () => {
    const newDate = localMoment(value, formatValue)
      .subtract(1, "day")
      .format(formatValue);
    onChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = localMoment(value, formatValue)
      .add(1, "day")
      .format(formatValue);
    onChange(newDate);
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover>
        <div className="flex items-center border-[1px] border-[#E7EDF1]">
          <div
            onClick={handlePreviousDay}
            className="cursor-pointer select-none w-[30px] h-[30px] flex justify-center items-center"
          >
            <LeftArrow2 />
          </div>
          <PopoverTrigger asChild>
            <div className="w-full h-[40px] flex items-center p-[0_15px] rounded-[4px] cursor-pointer">
              <div className="flex-1 text-center">
                <span>
                  {value
                    ? localMoment(value, formatValue).format(format)
                    : placeholder}
                </span>
              </div>

              <DatePickerIcon width="20px" height="20px" color="#919FB4" />
            </div>
          </PopoverTrigger>
          <div
            className="cursor-pointer select-none w-[30px] h-[30px] flex justify-center items-center"
            onClick={handleNextDay}
          >
            <RightArrow2 />
          </div>
        </div>

        <PopoverContent className="w-auto p-0">
          <div className="schedule-day-picker">
            <PickerPanel
              format={format}
              value={value ? localMoment(value, formatValue) : undefined}
              onChange={(date) => {
                const newValue = localMoment(date as Moment).format(
                  formatValue
                );

                onChange(newValue);
              }}
              locale={en_US}
              generateConfig={momentGenerateConfig}
              picker="date"
              showNow={false}
            />
          </div>
          <div
            onClick={() => {
              onChange(localMoment().format(formatValue));
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

export default DayPicker;
