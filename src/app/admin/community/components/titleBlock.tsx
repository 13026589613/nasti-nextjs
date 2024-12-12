import React from "react";

import { cn } from "@/lib/utils";
import useUserStore from "@/store/useUserStore";

interface TitleBlockProps {
  children?: React.ReactNode;
  title?: string;
  link?: Function;
  className?: string | object;
}
export default function TitleBlock({
  children,
  title,
  className,
  link,
}: TitleBlockProps) {
  const { isOnboarding } = useUserStore.getState();

  return (
    <div className={cn("mt-[40px]", className)}>
      <div className="flex items-center mb-[15px]">
        {isOnboarding && (
          <span className="h-[24px] mr-[6px] border-2 border-[var(--primary-color)]" />
        )}

        <span className="font-[450] ml-[5px] text-[18px] text-[rgba(0,0,0,0.85)]">
          {title}
        </span>
        <span className="ml-[30px]">{link && link()}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
