"use client";
import { useInViewport } from "ahooks";
import { useEffect, useRef } from "react";

type ViewportContainerProps = {
  className?: string;
  children: React.ReactNode;
  onEnter?: () => void;
};

const ViewportContainer = (props: ViewportContainerProps) => {
  const { className, children, onEnter } = props;

  const ref = useRef(null);

  const [inViewport] = useInViewport(ref);

  useEffect(() => {
    if (inViewport !== undefined) {
      if (inViewport) {
        onEnter?.();
      }
    }
  }, [inViewport]);

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
};

export default ViewportContainer;
