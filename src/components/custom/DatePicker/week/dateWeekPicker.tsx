import "rc-picker/assets/index.css";
import "./dateWeek.sass";

import moment, { Moment } from "moment";
import Picker from "rc-picker";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import en_US from "rc-picker/lib/locale/en_US";
import { forwardRef, useState } from "react";

import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import DatePickerIcon from "~/icons/DatePickerIcon.svg";

interface DatePickerProps {
  className?: string;
  format?: string;
  formatValue?: string;
  value: string | Date | undefined;
  onChange: (dateString: string | string[]) => void;
  placeholder?: string;
  disabledDate?: (current: moment.Moment) => boolean;
  disabled?: boolean;
  allowClear?: boolean;
  dateRange: (value: any) => void;
  isShowNow?: boolean;
}

const DatePicker = (props: DatePickerProps) => {
  const {
    className,
    formatValue = "MM/DD/YYYY",
    value,
    onChange,
    placeholder = "Select time",
    disabledDate,
    disabled,
    allowClear,
    dateRange,
    isShowNow = false,
  } = props;

  const { localMoment, globalTimeZone } = useGlobalTime();

  moment.tz.setDefault(globalTimeZone);

  const [pickerValue, SetPickerValue] = useState<Moment | undefined>(undefined);

  return (
    <div className={cn("custom-week-picker-self w-full", className)}>
      <Picker<Moment>
        width="311px"
        value={value ? localMoment(value, formatValue) : undefined}
        onChange={(date, formatString) => {
          const value = date
            ? localMoment(date as Moment).format(formatValue)
            : "";
          const startDate = localMoment(date as Moment)
            .startOf("week")
            .format(formatValue);
          const endDate = localMoment(date as Moment)
            .endOf("week")
            .format(formatValue);
          onChange(value);
          dateRange([startDate, endDate]);
        }}
        locale={en_US}
        generateConfig={momentGenerateConfig}
        placeholder={placeholder}
        picker="week"
        getPopupContainer={(node) => node.parentElement as HTMLElement}
        allowClear={allowClear}
        suffixIcon={
          <DatePickerIcon width="20px" height="20px" color="#919FB4" />
        }
        disabled={disabled ? true : false}
        needConfirm={false}
        showNow={false}
        disabledDate={disabledDate}
        pickerValue={pickerValue}
        onPanelChange={(date) => {
          SetPickerValue(date);
        }}
        renderExtraFooter={() =>
          isShowNow && (
            <div
              onClick={() => {
                onChange(localMoment().format(formatValue));
                SetPickerValue(localMoment());
              }}
              className="h-[42px] w-full text-primary text-[16px] font-[400] bg-white text-center leading-[42px] border-t border-t-[#F0F0F0] cursor-pointer"
            >
              Today
            </div>
          )
        }
        components={{
          input: CustomInput,
        }}
      />
    </div>
  );
};

export default DatePicker;

const CustomInput = forwardRef((props: any, ref) => {
  const { value, onChange } = props;
  const { startOfWeek } = useGlobalCommunityId();

  const parseWeekString = (weekStr: string) => {
    const [year, week] = weekStr.split("-");
    const weekNumber = parseInt(week.replace(/(st|nd|rd|th)/, ""), 10);
    return moment().year(parseInt(year, 10)).week(weekNumber);
  };

  const checkIsValidWeek = (weekStr: string) => {
    const regex = /^\d{4}-(\d{1,2})(st|nd|rd|th)$/;
    if (!regex.test(weekStr)) {
      return false;
    }
    const [year] = weekStr.split("-");
    return moment().year(parseInt(year, 10)).isValid();
  };

  let displayValue = value ? value : "";

  if (checkIsValidWeek(value)) {
    const thisYear = parseWeekString(value).startOf("year").format("e");

    if (thisYear !== startOfWeek.toString()) {
      displayValue = parseWeekString(value)
        .startOf("week")
        .subtract(1, "week")
        .format("YYYY-wo");
    } else {
      displayValue = value;
    }
  }

  return (
    <input
      ref={ref}
      {...props}
      value={displayValue}
      onChange={(e) => {
        const value = e.target.value;

        if (checkIsValidWeek(value)) {
          const thisYear = moment(value, "YYYY-wo").startOf("year").format("e");
          if (value) {
            if (thisYear !== startOfWeek.toString()) {
              displayValue = moment(value, "YYYY-wo")
                .add(1, "week")
                .format("YYYY-wo");
            } else {
              displayValue = value;
            }
          }
          onChange({ ...e, target: { ...e.target, value: displayValue } });
        } else {
          onChange(e);
        }
      }}
    />
  );
});

CustomInput.displayName = "CustomInput";
