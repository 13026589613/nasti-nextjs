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

interface MonthPickerProps {
  className?: string;
  format?: string;
  formatValue?: string;

  value: string;

  onChange: (value: string) => void;

  placeholder?: string;
}

const MonthPicker = (props: MonthPickerProps) => {
  const {
    className,
    format = "MMMM YYYY",
    formatValue = "MM/YYYY",
    value,
    onChange,
    placeholder = "Select Date",
  } = props;

  const { localMoment, globalTimeZone } = useGlobalTime();

  moment.tz.setDefault(globalTimeZone);

  const handlePreviousMonth = () => {
    const newDate = localMoment(value, formatValue)
      .subtract(1, "month")
      .format(formatValue);
    onChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = localMoment(value, formatValue)
      .add(1, "month")
      .format(formatValue);
    onChange(newDate);
  };

  return (
    <div className={cn("w-full outline-none", className)}>
      <Popover>
        <div className="flex items-center border-[1px] border-[#E7EDF1]">
          <div
            onClick={handlePreviousMonth}
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
            onClick={handleNextMonth}
          >
            <RightArrow2 />
          </div>
        </div>

        <PopoverContent className="w-auto p-0 outline-none">
          <div className="schedule-month-picker outline-none">
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
              picker="month"
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

export default MonthPicker;
