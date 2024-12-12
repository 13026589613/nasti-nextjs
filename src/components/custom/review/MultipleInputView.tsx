import { cn } from "@/lib/utils";

export interface MultipleInputViewProps {
  value?: string[] | number[] | undefined | null;
  valueRender?: React.ReactNode;
  label: string;
  className?: string;
}
const MultipleInputView = (props: MultipleInputViewProps) => {
  const { value, label, valueRender, className } = props;
  return (
    <div className={cn(className)}>
      <div className="flex items-center text-[16px] text-[#324664] font-[400] leading-10">
        {label}
      </div>
      <div className="flex flex-wrap gap-2 items-center min-h-10 text-[16px] text-[#919FB4] leading-10">
        {value &&
          value.map((item, index) => {
            return (
              <div
                key={item + " " + index}
                className="min-h-6 px-[9px] border-[1px] rounded-[4px]
                 border-[#919FB4] bg-[#F4F4F4] text-[16px]
                  text-[#00000073] font-[390] leading-6"
              >
                {item}
              </div>
            );
          })}

        {!value && valueRender}
      </div>
    </div>
  );
};

export default MultipleInputView;
