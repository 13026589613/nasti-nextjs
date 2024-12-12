"use client";

import React from "react";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

type labelPositionT = "horizontal" | "vertical";
interface CustomFormItemProps {
  isOccupy?: boolean;
  isShowMessage?: boolean;
  messageHeight?: number;
  required?: boolean;
  label?: string | null;
  children: React.ReactNode;
  labelPosition?: labelPositionT;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  formMessageClassName?: string;
  onClick?: (e: any) => void;
}

export default function CustomFormItem({
  label,
  labelClassName,
  inputClassName,
  required,
  children,
  className,
  labelPosition = "horizontal",
  formMessageClassName,
  isShowMessage = true,
  isOccupy,
  onClick,
}: CustomFormItemProps) {
  return (
    <FormItem className="space-y-0 relative ">
      <div
        className={cn(
          " overflow-visible",
          className,
          labelPosition === "vertical" ? "flex items-center" : ""
        )}
      >
        {label && (
          <FormLabel>
            <div
              className={cn(
                "mr-4 leading-10 text-left font-[390] text-[#324664]",
                labelClassName
              )}
            >
              {label}
              {required && (
                <span className="ml-[5px] font-[390] text-[16px] text-[var(--primary-color)]">
                  *
                </span>
              )}
            </div>
          </FormLabel>
        )}
        <FormControl>
          <div onClick={onClick} className={cn("w-full", inputClassName)}>
            {children}
          </div>
        </FormControl>
      </div>
      {isShowMessage && (
        <FormMessage
          isOccupy={isOccupy}
          className={cn(
            "h-5",
            formMessageClassName,
            "text-[#ec4899] pt-[6px] font-[400] "
          )}
        />
      )}
    </FormItem>
  );
}
