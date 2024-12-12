import { useEffect, useMemo, useState } from "react";

import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";

type CurrentTimelineProps = {
  contentWidth: number;
  hourWidth: number;
};

const CurrentTimeline = (props: CurrentTimelineProps) => {
  const { contentWidth, hourWidth } = props;

  const { localMoment } = useGlobalTime();

  const [currentTime, setCurrentTime] = useState(localMoment().toDate());

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(localMoment().toDate());
    };

    const now = new Date();
    const secondsUntilNextMinute = 60 - now.getSeconds();
    const firstTimeout = setTimeout(() => {
      updateCurrentTime();
      setInterval(updateCurrentTime, 60 * 1000);
    }, secondsUntilNextMinute * 1000);

    return () => {
      clearTimeout(firstTimeout);
    };
  }, []);

  const getOffsetX = useMemo(() => {
    const duration = localMoment(currentTime).diff(
      localMoment(currentTime).startOf("day"),
      "minutes"
    );

    const offset = (duration / 60) * hourWidth - 5;

    const offsetPercentage = (offset / contentWidth) * 100;

    return {
      offset,
      offsetPercentage,
    };
  }, [hourWidth, currentTime, contentWidth]);

  return (
    <div className="absolute h-full w-full flex justify-end">
      <div
        className="absolute h-full"
        style={{
          width: contentWidth,
        }}
      >
        <div
          className="absolute z-[3] w-[2px] bg-[#EB1DB2] h-full"
          style={{
            left: getOffsetX.offset,
          }}
        >
          <div
            className={cn(
              "absolute top-[-10px] w-[50px] h-[20px] bg-[#EB1DB2] flex justify-center items-center text-[#fff] z-[4]",

              getOffsetX.offsetPercentage > 98 ? "left-[-35px]" : "left-[-22px]"
            )}
          >
            {`${localMoment(currentTime).format("HH:mm")}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentTimeline;
