import "rc-picker/assets/index.css";
import "./style.sass";

import moment, { Moment } from "moment";
import Picker from "rc-picker";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import en_US from "rc-picker/lib/locale/en_US";

import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import CloseIcon from "~/icons/CloseIcon.svg";
import DatePickerIcon from "~/icons/DatePickerIcon.svg";

interface DatePickerProps {
  className?: string;
  format?: string;
  formatValue?: string;
  value: string[] | undefined;
  onChange: (dateString: string[] | undefined) => void;
  placeholder?: string;
  disabledDate?: (current: moment.Moment) => boolean;
  disabled?: boolean;
  allowClear?: boolean;
  defaultPickerValue?: Moment | undefined;
}

const DatePicker = (props: DatePickerProps) => {
  const {
    className,
    format = "MM/DD/YYYY",
    formatValue = "MM/DD/YYYY",
    value,
    onChange,
    placeholder = "Select Date",
    disabledDate,
    disabled,
    allowClear,
    defaultPickerValue,
  } = props;

  const { localMoment, globalTimeZone } = useGlobalTime();

  moment.tz.setDefault(globalTimeZone);

  return (
    <div className={cn("multiple-date-picker w-full", className)}>
      <Picker
        format={format}
        value={
          value?.length
            ? value.map((v) => localMoment(v, formatValue))
            : undefined
        }
        onChange={(dates) => {
          const values = (dates as moment.Moment[])?.map((date) =>
            localMoment(date as Moment).format(formatValue)
          );

          onChange(values ?? []);
        }}
        defaultPickerValue={defaultPickerValue}
        locale={en_US}
        generateConfig={momentGenerateConfig}
        placeholder={placeholder}
        multiple
        picker="date"
        maxTagCount="responsive"
        showNow={false}
        getPopupContainer={(node) => node.parentElement as HTMLElement}
        allowClear={
          allowClear
            ? {
                clearIcon: (
                  <CloseIcon width="10px" height="10px" color="#EB1DB2" />
                ),
              }
            : false
        }
        suffixIcon={
          <DatePickerIcon width="20px" height="20px" color="#919FB4" />
        }
        disabled={disabled ? true : false}
        needConfirm={false}
        disabledDate={disabledDate}
        removeIcon={
          <CloseIcon
            className="inline-block"
            width="10px"
            height="10px"
            color="#EB1DB2"
          />
        }
      />
    </div>
  );
};

export default DatePicker;
