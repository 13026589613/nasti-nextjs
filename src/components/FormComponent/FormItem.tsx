import React from "react";
import {
  Control,
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  GlobalError,
  UseControllerProps,
} from "react-hook-form";

import { cn } from "@/lib/utils";

type FormItemProps<T extends FieldValues, TName extends FieldPath<T>> = {
  className?: string;
  width?: string;
  errors?: GlobalError;
  border?: boolean;
  control?: Control<T>;
} & Omit<ControllerProps<T, TName>, "control"> &
  Omit<UseControllerProps<T, TName>, "control">;

const FormItem = <T extends FieldValues, TName extends FieldPath<T>>(
  props: FormItemProps<T, TName>
) => {
  const {
    className,
    name,
    control,
    rules,
    width,
    errors,
    border = true,
    render,
  } = props;

  return (
    <div
      key={name}
      className={className}
      style={{
        width,
      }}
    >
      <div className={cn("mb-[18px] relative")}>
        <div
          className={cn("rounded-[4px] border-[transparent]", {
            "border-[#B3BAC1]": border && !errors,
            "border-[#ec4899]": border && errors,
            "border-[1px]": border && errors,
          })}
        >
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={render}
          />
        </div>

        {errors && errors?.message && (
          <div className="absolute top-[100%] left-0 text-[14px] text-[#ec4899]">
            {errors?.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormItem;
