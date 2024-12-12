import { cn } from "@/lib/utils";

export type TabsButtonItem = {
  key: any;
  name: string;
};

type TabsButtonProps = {
  currentKey: string;
  items: TabsButtonItem[];
  className?: string;
  itemClassName?: string;
  onChange: (key: any) => void;
};

const TabsButton = (props: TabsButtonProps) => {
  const { currentKey, items, className, itemClassName, onChange } = props;

  return (
    <div className={cn("flex h-[40px]", className)}>
      {items.map(({ key, name }) => {
        return (
          <div
            key={key}
            className={cn(
              "flex justify-center items-center cursor-pointer min-w-[120px] group",
              currentKey === key
                ? "bg-[#F2F5FD] text-primary"
                : "bg-[#E4EEFD] text-[#324664]",
              itemClassName
            )}
            onClick={() => onChange(key)}
          >
            <span className="w-full border-r-[1px] border-r-[#CECECE] text-center group-last:border-r-[transparent]">
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TabsButton;
