import * as React from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import BottomArrow from "~/icons/BottomArrow.svg";
import TopArrow from "~/icons/TopArrow.svg";

export interface InputNumberProps {
  onChange?: Function;
  ref?: any;
  disabled?: boolean;
  min?: number;
  max?: number;
  defaultValue?: number;
  step?: number;
  className?: any;
  type?: string;
}

const InputNumber = ({
  type,
  className,
  ref,
  min,
  max,
  step,
  defaultValue,
  onChange,
  ...props
}: InputNumberProps) => {
  const [inputValue, setInputValue]: any = useState(defaultValue);
  const maxFlag = max && inputValue >= max;
  const minFlag = min && inputValue <= min;
  function handleIncrease() {
    if (maxFlag) return;
    setInputValue(inputValue + (step || 1));
    onChange && onChange(inputValue);
  }
  function handleReduce() {
    if (minFlag) return;
    setInputValue(inputValue - (step || 1));
    onChange && onChange(inputValue);
  }

  return (
    <span
      className={cn(
        `flex h-[40px] items-center rounded p-1 border border-input hover:outline-none ${
          !props.disabled
            ? "hover:ring-2 hover:ring-ring hover:ring-offset-2"
            : ""
        }`,
        className
      )}
    >
      <input
        className="w-full ml-1 mr-1 outline-none text-muted-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        type={type}
        ref={ref}
        value={inputValue}
        onBlur={(e) => {
          if (!/^\d*$/.test(e.target.value)) {
            setInputValue("");
          }
        }}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        {...props}
      />
      <span className={`${props.disabled ? "cursor-not-allowed" : ""}`}>
        <TopArrow
          width="10"
          height="6"
          color="#919FB4"
          className={`mb-2 ${
            props.disabled
              ? "cursor-not-allowed pointer-events-none"
              : "hover:cursor-pointer"
          }`}
          onClick={() => {
            handleIncrease();
          }}
        />
        <BottomArrow
          className={`${
            props.disabled
              ? "cursor-not-allowed pointer-events-none"
              : "hover:cursor-pointer"
          }`}
          width="10"
          height="6"
          color="#919FB4"
          onClick={() => {
            handleReduce();
          }}
        />
      </span>
    </span>
  );
};

export default InputNumber;
