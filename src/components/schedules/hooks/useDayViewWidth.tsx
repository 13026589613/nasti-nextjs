import { useMemo } from "react";

import useSize from "@/components/schedules/hooks/useSize";

const useDayViewWidth = (ref: React.RefObject<Element>) => {
  const wrapperWidth = useSize(ref)?.width || 0;
  const wrapperHeight = useSize(ref)?.height || 0;

  const hourWidth = useMemo(() => {
    return Math.round((wrapperWidth - 100) / 24);
  }, [wrapperWidth]);

  const contentWidth = useMemo(() => {
    return hourWidth * 24;
  }, [hourWidth]);

  return {
    wrapperWidth,
    hourWidth,
    contentWidth,
    wrapperHeight,
  };
};

export default useDayViewWidth;
