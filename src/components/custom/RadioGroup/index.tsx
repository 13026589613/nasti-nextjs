import React from "react";
import { ControllerRenderProps } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
export interface CustomRadioGroupOptions {
  label: React.ReactElement | string;
  value: string;
}
export interface CustomRadioGroupProps extends Partial<ControllerRenderProps> {
  options: CustomRadioGroupOptions[];
}
const CustomRadioGroup = React.forwardRef<
  HTMLInputElement,
  CustomRadioGroupProps
>((props: CustomRadioGroupProps, ref) => {
  const { options, onChange } = props;
  return (
    <RadioGroup ref={ref} {...props} defaultValue="comfortable">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem
            onClick={() => {
              onChange && onChange({ target: { value: option.value } });
            }}
            value={option.value}
            id={option.value}
          />
          <Label
            onClick={() => {
              onChange && onChange({ target: { value: option.value } });
            }}
            htmlFor={option.value}
          >
            {option.label}
          </Label>
        </div>
      ))}
      {/* <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div> */}
    </RadioGroup>
  );
});
CustomRadioGroup.displayName = "CustomRadioGroup";
export default CustomRadioGroup;
