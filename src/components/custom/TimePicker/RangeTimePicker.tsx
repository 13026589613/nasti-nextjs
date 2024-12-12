import "rc-picker/assets/index.css";
import "./style.sass";

import moment from "moment";
import { RangePicker } from "rc-picker";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import en_US from "rc-picker/lib/locale/en_US";

import useGlobalTime from "@/hooks/useGlobalTime";
import ClockSkeletonIcon from "~/icons/ClockSkeletonIcon.svg";

interface RangeTimePickerProps {
  startTime: string;
  endTime: string;

  onChange: ({
    startTime,
    endTime,
  }: {
    startTime: string;
    endTime: string;
  }) => void;

  startPlaceholder?: string;
  endPlaceholder?: string;
}

const RangeTimePicker = (props: RangeTimePickerProps) => {
  const {
    startTime,
    endTime,
    onChange,
    startPlaceholder = "Start time",
    endPlaceholder = "End time",
  } = props;

  const { localMoment, globalTimeZone } = useGlobalTime();

  moment.tz.setDefault(globalTimeZone);

  return (
    <div className="custom-time-picker">
      <RangePicker
        value={[
          startTime ? localMoment(startTime, "hh:mm a") : null,
          endTime ? localMoment(endTime, "hh:mm a") : null,
        ]}
        onChange={(date, dateString) => {
          onChange({
            startTime: dateString[0],
            endTime: dateString[1],
          });
        }}
        locale={en_US}
        generateConfig={momentGenerateConfig}
        picker="time"
        use12Hours
        showNow={false}
        showSecond={false}
        placeholder={[startPlaceholder, endPlaceholder]}
        getPopupContainer={(node) => node.parentElement as HTMLElement}
        allowClear={false}
        suffixIcon={
          <ClockSkeletonIcon width="20px" height="20px" color="#919FB4" />
        }
      />
    </div>
  );
};

export default RangeTimePicker;
