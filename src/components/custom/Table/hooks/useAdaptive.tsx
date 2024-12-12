"use client";
import debounce from "lodash/debounce";
import { useEffect, useState } from "react";

const useAdaptive = (adaptive: boolean | undefined, isPagination: boolean) => {
  const [adaptiveHeight, setAdaptiveHeight] = useState(0);

  const bottomHeight = isPagination ? 100 : 40;

  const handleResize = () => {
    const top =
      document.querySelector(".custom-table")?.getBoundingClientRect()?.top ||
      0;

    setAdaptiveHeight(window.innerHeight - top - bottomHeight);
  };

  const debounceHandleResize = debounce(handleResize, 60);

  useEffect(() => {
    if (adaptive) {
      debounceHandleResize();
      window.addEventListener("resize", debounceHandleResize);
    }

    return () => {
      adaptive && window.removeEventListener("resize", debounceHandleResize);
    };
  }, []);

  return {
    adaptiveHeight,
  };
};

export default useAdaptive;
