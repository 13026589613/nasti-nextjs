import "react-color-palette/css";

import { ColorPicker, useColor } from "react-color-palette";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type CustomColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  wrapperClassName?: string;
  textClassName?: string;
  disabled?: boolean;
};

const CustomColorPicker = (props: CustomColorPickerProps) => {
  const {
    value = "#000000",
    onChange,
    wrapperClassName,
    textClassName,
    disabled = false,
  } = props;

  const [hexColor, setHexColor] = useColor(value);

  return (
    <Popover>
      <PopoverTrigger className="w-full" disabled={disabled}>
        <div
          className={cn(
            "w-full flex items-center justify-between h-[40px] p-[0_11px_0_20px] rounded-[4px] border border-[#E7EDF1] cursor-pointer",
            wrapperClassName
          )}
        >
          <span className={cn("font-[390] text-[#919FB4]", textClassName)}>
            {hexColor.hex}
          </span>
          <div
            className="w-[18px] h-[18px]"
            style={{
              backgroundColor: hexColor.hex,
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <ColorPicker
          color={hexColor}
          onChange={(v) => {
            setHexColor(v);
            onChange(v.hex);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default CustomColorPicker;
