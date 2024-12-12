import React from "react";

import { cn } from "@/lib/utils";

type labelPositionT = "horizontal" | "vertical";
interface CustomFormItemProps {
  label?: string | null;
  children: React.ReactNode;
  labelPosition?: labelPositionT;
  className?: string;
  labelClassName?: string;
}

export default function FormItemLabel({
  label,
  labelClassName,
  children,
  className,
  labelPosition = "horizontal",
}: CustomFormItemProps) {
  return (
    <div className={cn("font-[390] text-[14px]", className)}>
      <div className={cn("w-full leading-10 ", labelClassName)}>{label}</div>
      {children}
    </div>
  );
}
