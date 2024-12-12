import { useRef } from "react";

import Input from "@/components/custom/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CheckSearchListProps {
  list: Array<{ label: string; value: number; checked: boolean }>;
  showCheckList: Function;
}
const CheckSearchList = (props: CheckSearchListProps) => {
  const { list, showCheckList } = props;
  const inputRef: any = useRef();
  function setChecked(
    value: boolean,
    item: { label: string; value: number; checked: boolean }
  ) {
    const arr = list.map((one) => {
      if (item.value == one.value) {
        one.checked = !value;
      }
      return one;
    });
    showCheckList && showCheckList(arr);
  }
  function handleSearch(value: any) {}

  const keyupadditem = (e: any) => {
    if (e.which !== 13) return;
    handleSearch(e.target.value);
  };
  return (
    <div className="h-full flex flex-col">
      <div className="my-[12px]">
        <Input
          suffix="SearchIcon"
          className="h-[32px]"
          onClick={handleSearch}
          suffixClassName="w-[14px]"
          ref={inputRef}
          onKeyUp={keyupadditem}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-auto">
        <ScrollArea>
          {list.map((item) => {
            return (
              <div
                key={item.value}
                className="h-[34px] shrink-0 flex items-center space-x-2"
              >
                <Checkbox
                  id={`terms${item.value}`}
                  checked={item.checked}
                  onCheckedChange={() => setChecked(item.checked, item)}
                />
                <label
                  htmlFor={`terms${item.value}`}
                  className="font-[400] text-[#919FB4] text-[14px]"
                >
                  {item.label}
                </label>
              </div>
            );
          })}
        </ScrollArea>
      </div>
    </div>
  );
};
export default CheckSearchList;
