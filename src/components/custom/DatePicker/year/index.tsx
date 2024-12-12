import "rc-picker/assets/index.css";
import "./style.sass";

import moment, { Moment } from "moment";
import Picker from "rc-picker";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import en_US from "rc-picker/lib/locale/en_US";

import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import DatePickerIcon from "~/icons/DatePickerIcon.svg";

interface DatePickerProps {
  className?: string;
  format?: string;
  formatValue?: string;
  value: string | Date | undefined;
  onChange: (dateString: string) => void;
  placeholder?: string;
  disabledDate?: (current: moment.Moment) => boolean;
  disabled?: boolean;
  allowClear?: boolean;
}

const DatePicker = (props: DatePickerProps) => {
  const {
    className,
    format = "YYYY",
    formatValue = "YYYY",
    value,
    onChange,
    placeholder = "Select time",
    disabledDate,
    disabled,
    allowClear,
  } = props;

  const { localMoment, globalTimeZone } = useGlobalTime();

  moment.tz.setDefault(globalTimeZone);

  return (
    <div className={cn("custom-date-picker w-full", className)}>
      <Picker
        width="311px"
        format={format}
        value={value ? localMoment(value, formatValue) : null}
        onChange={(date) => {
          const value = localMoment(date as Moment).format("YYYY");

          onChange(value);
        }}
        locale={en_US}
        generateConfig={momentGenerateConfig}
        placeholder={placeholder}
        picker="year"
        showNow={false}
        getPopupContainer={(node) => node.parentElement as HTMLElement}
        allowClear={allowClear}
        suffixIcon={
          <DatePickerIcon width="20px" height="20px" color="#919FB4" />
        }
        disabled={disabled ? true : false}
        needConfirm={false}
        disabledDate={disabledDate}
      />
    </div>
  );
};

export default DatePicker;
