import "rc-picker/assets/index.css";
import "./style.sass";

import moment, { Moment } from "moment";
import Picker from "rc-picker";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import en_US from "rc-picker/lib/locale/en_US";

import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import DatePickerIcon from "~/icons/DatePickerIcon.svg";

interface MonthPickerProps {
  className?: string;
  format?: string;
  formatValue?: string;
  value: string | Date;
  onChange: (dateString: string) => void;
  placeholder?: string;
}

const MonthPicker = (props: MonthPickerProps) => {
  const {
    className,
    format = "MMM YYYY",
    formatValue = "MM/YYYY",
    value,
    onChange,
    placeholder = "Select Month",
  } = props;

  const { localMoment, globalTimeZone } = useGlobalTime();

  moment.tz.setDefault(globalTimeZone);

  return (
    <div className={cn("custom-month-picker w-full", className)}>
      <Picker
        width="311px"
        format={format}
        value={value ? localMoment(value, formatValue) : undefined}
        onChange={(date) => {
          const value = localMoment(date as Moment).format(formatValue);
          onChange(value);
        }}
        locale={en_US}
        generateConfig={momentGenerateConfig}
        placeholder={placeholder}
        picker="month"
        showNow={false}
        getPopupContainer={(node) => node.parentElement as HTMLElement}
        allowClear={false}
        suffixIcon={
          <DatePickerIcon width="20px" height="20px" color="#919FB4" />
        }
        needConfirm={false}
      />
    </div>
  );
};

export default MonthPicker;
