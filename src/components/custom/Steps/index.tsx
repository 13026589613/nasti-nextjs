"use client";

import { cn } from "@/lib/utils";

interface StepsProps {
  current: number;
  items: Array<{
    title: string;
  }>;
}

const Steps = (props: StepsProps) => {
  const { current, items } = props;

  return (
    <div className="w-full flex">
      {items.map((item, i) => {
        const index = i + 1;
        const isLast = !(index < items.length);
        const isCurrentActive = current === index;
        const isPass = current > index;

        return (
          <div key={i} className={cn("relative flex-1")}>
            <div className="relative h-[50px]">
              <div
                className={cn(
                  "absolute left-[50%] w-[50px] h-[50px] rounded-[50%] flex justify-center items-center text-[24px] z-[2]",
                  isPass || isCurrentActive ? "bg-primary" : "bg-[#BDBDBD]",
                  isPass || isCurrentActive ? "text-[#fff]" : "text-[#00000073]"
                )}
                style={{
                  transform: "translateX(-50%)",
                }}
              >
                {index}
              </div>

              <div
                className="absolute top-[50%] left-[50%] right-[-50%]"
                style={{
                  transform: "translateY(-50%)",
                  borderWidth: isLast ? "none" : "5px",
                  borderColor: isPass ? "#d838ae" : "#D9D9D9",
                }}
              />
            </div>
            <div
              className={cn(
                "text-center text-[18px] mt-[16px]",
                isPass || isCurrentActive
                  ? "text-primary"
                  : "text-[#00000073] dark:text-white"
              )}
            >
              {item.title}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Steps;
