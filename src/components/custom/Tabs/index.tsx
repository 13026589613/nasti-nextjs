import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import NumberCircle from "../NumberCircle";

interface TabsProps {
  onclick?: Function;
  defaultActiveKey?: string;
  items:
    | Array<{
        key: string;
        label: string;
        unread?: number | string;
      }>
    | any[];
  isChangeActive?: boolean;
  className?: string;
}
export default function Tabs({
  items,
  defaultActiveKey,
  onclick,
  className,
  isChangeActive = true,
}: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultActiveKey);
  function handleToggle(key: string) {
    onclick && onclick(key);
    if (isChangeActive) {
      setActiveIndex(key);
    }
  }

  useEffect(() => {
    setActiveIndex(defaultActiveKey);
  }, [defaultActiveKey]);

  const item = items.map((one) => {
    return (
      <li
        className={cn(
          `inline-block h-[45px] px-[40px] text-[18px] font-[450] cursor-pointer ${
            activeIndex === one.key
              ? "text-[#EB1DB2] border-b-2 border-[#EB1DB2] transition-all delay-150"
              : ""
          }`,
          className
        )}
        key={one.key}
        onClick={() => {
          handleToggle(one.key);
        }}
      >
        <div className="relative w-fit">
          {one.label}{" "}
          {one?.unread && one?.unread !== 0 && (
            <NumberCircle number={one?.unread}></NumberCircle>
          )}
        </div>
      </li>
    );
  });
  return <ul className="border-b border-[#E7EDF1]">{item}</ul>;
}
