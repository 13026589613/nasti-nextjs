"use client";

import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const PageContainer = (props: PageContainerProps) => {
  const { children, className, contentClassName } = props;

  const { theme } = useTheme();

  return (
    <div
      style={{
        boxShadow:
          theme === "light"
            ? "0px 8px 14px 0px rgba(216,221,230,0.5)"
            : undefined,
      }}
      className={cn(
        "h-full rounded-[4px] p-[15px] bg-[#e8edf1] dark:bg-[#0f0f0f]",
        className
      )}
    >
      <div className={cn("bg-background h-full p-[20px]", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
