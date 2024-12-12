import { RefObject, useEffect, useState } from "react";

const useResizeObserver = (
  ref: RefObject<HTMLDivElement>,
  callBack?: (width: number) => void
) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (entries[0].contentRect) {
        setWidth(entries[0].contentRect.width);
        callBack && callBack(entries[0].contentRect.width);
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [width] as const;
};

export default useResizeObserver;
