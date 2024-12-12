import "rc-picker/assets/index.css";
import "./style.sass";

import moment from "moment";
import Picker from "rc-picker";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import en_US from "rc-picker/lib/locale/en_US";

import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import ClockSkeletonIcon from "~/icons/ClockSkeletonIcon.svg";

interface TimePickerProps {
  className?: string;
  disabled?: boolean;
  value: string | undefined;
  onChange: (dateString: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  style?: React.CSSProperties;
}

const TimePicker = (props: TimePickerProps) => {
  const {
    className,
    value,
    onChange,
    placeholder = "Select time",
    disabled = false,
    allowClear = false,
    style,
  } = props;

  const { localMoment, globalTimeZone } = useGlobalTime();

  moment.tz.setDefault(globalTimeZone);

  return (
    <div className={cn("custom-time-picker", className)}>
      <Picker
        style={style}
        disabled={disabled}
        className="border-[0]"
        value={value ? localMoment(value, "hh:mm a") : undefined}
        onChange={(date, dateString) => {
          onChange(dateString as string);
        }}
        locale={en_US}
        generateConfig={momentGenerateConfig}
        placeholder={placeholder}
        picker="time"
        use12Hours
        showNow={false}
        showSecond={false}
        getPopupContainer={(node) => node.parentElement as HTMLElement}
        allowClear={allowClear}
        needConfirm={false}
        suffixIcon={
          <ClockSkeletonIcon width="20px" height="20px" color="#919FB4" />
        }
      />
    </div>
  );
};

export default TimePicker;
