import React from "react";

import useResizeObserver from "@/hooks/useResizeObserver";
import { cn } from "@/lib/utils";

export interface InputReviewProps {
  value: string | number | undefined | null | React.ReactNode;
  label: string;
  className?: string;
  labelClassName?: string;
  layout?: "horizontal" | "vertical";
}
const InputReview = (props: InputReviewProps) => {
  const {
    value,
    label,
    className,
    labelClassName,
    layout = "vertical",
  } = props;

  const labelRef = React.useRef<HTMLDivElement>(null);

  const [width] = useResizeObserver(labelRef);

  return (
    <>
      {layout === "horizontal" ? (
        <div className={cn("flex items-start gap-2", className)}>
          <div
            ref={labelRef}
            className={cn(
              "text-[16px] text-[#324664] font-[400] leading-10",
              labelClassName
            )}
          >
            {label}
          </div>
          <div
            style={{
              width: `calc(100% - ${width}px)`,
            }}
            className={cn(
              "min-h-10 text-[16px] text-[#919FB4] leading-10 break-words"
            )}
          >
            {value}
          </div>
        </div>
      ) : (
        <div className={cn(className)}>
          <div className="flex items-center text-[16px] text-[#324664] font-[400] leading-10">
            {label}
          </div>
          <div className="flex items-center min-h-10 text-[16px] text-[#919FB4] leading-10">
            {value}
          </div>
        </div>
      )}
    </>
  );
};

export default InputReview;
