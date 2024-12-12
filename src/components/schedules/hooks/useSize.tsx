import useResizeObserver from "@react-hook/resize-observer";
import { useLayoutEffect, useState } from "react";

const useSize = (target: React.RefObject<Element>) => {
  const [size, setSize] = useState<DOMRectReadOnly>();

  useLayoutEffect(() => {
    if (target.current) {
      setSize(target.current.getBoundingClientRect());
    }
  }, [target]);

  useResizeObserver(target, (entry) => setSize(entry.contentRect));

  return size;
};

export default useSize;
