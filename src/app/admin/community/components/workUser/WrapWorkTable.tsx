import React from "react";

import SquareIcon from "~/icons/SquareIcon.svg";
import SquarelDotIcon from "~/icons/SquarelDotIcon.svg";
import UnderArrow from "~/icons/UnderArrow.svg";
interface WrapWorkTableProps {
  children?: React.ReactNode;
  list: Array<{ label: string; value: number; checked: boolean }>;
  reload?: () => void;
}
const WrapWorkTable = (props: WrapWorkTableProps) => {
  const { list, reload, children } = props;
  const index = list.filter((item) => item.checked).length ?? 0;
  return (
    <div className="w-[308px] h-[409px] flex flex-col border border-[#D9D9D9]">
      <div className="h-[38px]  px-3 border-b-[1px] border-b-[#D9D9D9] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="flex gap-1 items-center">
            {index ? <SquarelDotIcon /> : <SquareIcon color="#fff" />}
            <UnderArrow />
          </span>
          <span className="font-[400] text-[14px]">
            {`${index}/${list.length}`}
          </span>
          <span className="font-[400] -mt-[2px]">Admins</span>
        </div>
        <span>Source</span>
      </div>
      <div className="flex-1  px-3 overflow-hidden">{children}</div>
      <div className="h-[38px]  px-3 border-t-[1px] border-t-[#D9D9D9]  flex items-center justify-end">
        <div
          className="h-[24px] w-14 rounded-[2px] border border-[#D9D9D9] leading-[20px] text-center cursor-pointer font-[400] text-[14px]"
          onClick={() => reload && reload()}
        >
          reload
        </div>
      </div>
    </div>
  );
};
export default WrapWorkTable;
