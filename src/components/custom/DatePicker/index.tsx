import "rc-picker/assets/index.css";
import "./style.sass";

import moment, { Moment } from "moment";
import Picker from "rc-picker";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import en_US from "rc-picker/lib/locale/en_US";
import { useState } from "react";

import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import DatePickerIcon from "~/icons/DatePickerIcon.svg";
export type AlignPointTopBottom = "t" | "b" | "c";
export type AlignPointLeftRight = "l" | "r" | "c";
/** Two char of 't' 'b' 'c' 'l' 'r'. Example: 'lt' */
export type AlignPoint = `${AlignPointTopBottom}${AlignPointLeftRight}`;
export type OffsetType = number | `${number}%`;
interface AlignType {
  points?: (string | AlignPoint)[];

  _experimental?: Record<string, any>;

  offset?: OffsetType[];

  targetOffset?: OffsetType[];

  overflow?: {
    adjustX?: boolean | number;
    adjustY?: boolean | number;
    shiftX?: boolean | number;
    shiftY?: boolean | number;
  };

  autoArrow?: boolean;

  htmlRegion?: "visible" | "scroll" | "visibleFirst";

  dynamicInset?: boolean;

  useCssRight?: boolean;

  useCssBottom?: boolean;

  useCssTransform?: boolean;
  ignoreShake?: boolean;
}
interface DatePickerProps {
  className?: string;
  format?: string;
  formatValue?: string;
  value: string | undefined;
  onChange: (dateString: string | undefined) => void;
  placeholder?: string;
  disabledDate?: (current: moment.Moment) => boolean;
  disabled?: boolean;
  allowClear?: boolean;
  defaultPickerValue?: Moment | undefined;
  isShowNow?: boolean;
  style?: React.CSSProperties;
  placement?: "top" | "bottom";
  popupAlign?: AlignType;
}

const DatePicker = (props: DatePickerProps) => {
  const {
    className,
    format = "MM/DD/YYYY",
    formatValue = "MM/DD/YYYY",
    value,
    onChange,
    placeholder = "Select time",
    disabledDate,
    disabled,
    allowClear,
    defaultPickerValue,
    isShowNow = false,
    style,
    placement,
    popupAlign,
  } = props;

  const { localMoment, globalTimeZone } = useGlobalTime();

  moment.tz.setDefault(globalTimeZone);

  const [pickerValue, SetPickerValue] = useState<Moment | undefined>(undefined);

  return (
    <div className={cn("custom-date-picker-one w-full", className)}>
      <Picker
        width="311px"
        style={style}
        format={format}
        defaultPickerValue={defaultPickerValue}
        value={value ? localMoment(value, formatValue) : undefined}
        onChange={(date) => {
          const value =
            (date && localMoment(date as Moment).format(formatValue)) || "";
          onChange(value);
        }}
        pickerValue={pickerValue}
        onPanelChange={(date, info) => {
          SetPickerValue(date);
        }}
        locale={en_US}
        generateConfig={momentGenerateConfig}
        placeholder={placeholder}
        picker="date"
        showNow={false}
        getPopupContainer={(node) => node.parentElement as HTMLElement}
        allowClear={allowClear}
        suffixIcon={
          <DatePickerIcon width="20px" height="20px" color="#919FB4" />
        }
        disabled={disabled ? true : false}
        needConfirm={false}
        disabledDate={disabledDate}
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
        placement={placement}
        popupAlign={popupAlign}
      />
    </div>
  );
};

export default DatePicker;
