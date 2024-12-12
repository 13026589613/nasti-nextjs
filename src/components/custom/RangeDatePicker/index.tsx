import "rc-picker/assets/index.css";
import "./style.sass";

import moment from "moment";
import { RangePicker } from "rc-picker";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import en_US from "rc-picker/lib/locale/en_US";
import React from "react";

import useGlobalTime from "@/hooks/useGlobalTime";
import DatePickerIcon from "~/icons/DatePickerIcon.svg";
interface RangeDatePickerProps {
  className?: string;
  format?: string;
  formatValue?: string;

  value: any;

  onChange: (value: any) => void;

  placeholder?: [string, string];
}

const RangeDatePicker = (props: RangeDatePickerProps) => {
  const {
    format = "MM/DD/YYYY",
    formatValue = "MM/DD/YYYY",
    value,
    placeholder = ["From Date", " To Date"],
  } = props;
  const ref = React.useRef<any>(null);

  const { localMoment, globalTimeZone } = useGlobalTime();

  moment.tz.setDefault(globalTimeZone);

  return (
    <div className="relative pr-10 border-[1px] border-[#ecece9] rounded-md h-10">
      <RangePicker
        ref={ref}
        className="self-range-picker"
        classNames={{
          popup: "self-range-picker-popup",
        }}
        format={format}
        value={
          value
            ? [
                value[0] ? localMoment(value[0], formatValue) : null,
                value[1] ? localMoment(value[1], formatValue) : null,
              ]
            : null
        }
        onChange={(date) => {
          if (date) {
            props.onChange([
              date[0]?.format(formatValue),
              date[1]?.format(formatValue),
            ]);
          } else {
            props.onChange(null);
          }
        }}
        locale={en_US}
        generateConfig={momentGenerateConfig}
        picker="date"
        showNow={false}
        allowEmpty
        placeholder={placeholder}
      />
      <DatePickerIcon
        className="absolute top-1/2 right-3 transform -translate-y-1/2"
        width="20px"
        height="20px"
        color="#919FB4"
        onClick={() => {
          if (ref.current) {
            ref.current.nativeElement.click();
          }
        }}
      />
    </div>
  );
};

export default RangeDatePicker;
