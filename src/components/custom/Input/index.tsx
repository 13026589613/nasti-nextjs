import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import CloseEyeIcon from "~/icons/CloseEyeIcon.svg";
import EmailIcon from "~/icons/EmailIcon_input.svg";
import LockIcon from "~/icons/LockIcon.svg";
import OpenEyeIcon from "~/icons/OpenEyeIcon.svg";
import SearchIcon from "~/icons/SearchIcon.svg";
import SearchIcon2 from "~/icons/SearchIcon2.svg";
import UserIcon from "~/icons/UserIcon.svg";
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?:
    | "UserIcon"
    | "CloseEyeIcon"
    | "LockIcon"
    | "OpenEyeIcon"
    | "EmailIcon"
    | "SearchIcon"
    | "SearchIcon2";
  suffix?:
    | "UserIcon"
    | "CloseEyeIcon"
    | "LockIcon"
    | "OpenEyeIcon"
    | "EmailIcon"
    | "SearchIcon"
    | "SearchIcon2";
  onClick?: any;
  suffixClassName?: string;
  isClearable?: boolean;
}

const iconList: any = {
  UserIcon: <UserIcon width="20" height="20" />,
  CloseEyeIcon: <CloseEyeIcon width="20" height="20" />,
  LockIcon: <LockIcon width="20" height="20" />,
  OpenEyeIcon: <OpenEyeIcon width="20" height="20" />,
  EmailIcon: <EmailIcon width="20" height="20" />,
  SearchIcon: <SearchIcon width="20" height="20" />,
  SearchIcon2: <SearchIcon2 width="20" height="20" />,
};
const CustomInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      prefix,
      suffix,
      onClick,
      suffixClassName,
      onChange,
      isClearable = false,
      ...props
    },
    ref
  ) => {
    const prefixEle = (
      <span className="absolute top-[50%] translate-y-[-50%] left-[14px] flex items-center h-10 ">
        {prefix ? iconList[prefix] : ""}
      </span>
    );
    const suffixEle = (
      <span
        className={cn(
          "absolute top-[50%] translate-y-[-50%] right-[20px] flex items-center h-10 ",
          suffixClassName
        )}
        onClick={() => onClick && onClick()}
      >
        {suffix ? iconList[suffix] : ""}
      </span>
    );
    return (
      <div className="relative">
        {prefixEle}
        <Input
          type={type}
          ref={ref}
          onChange={onChange}
          {...props}
          value={
            props.value != undefined && props.value != null ? props.value : ""
          }
          className={cn(
            "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-2  ring-offset-pink-500",
            "placeholder:text-[rgba(0,0,0,0.25)] placeholder:text-[16px] px-2 text-[16px]",
            prefix && "pl-[50px]",
            suffix && "pr-[50px]",
            className
          )}
        ></Input>
        {suffixEle}
        {isClearable && props.value && (
          <span
            className={cn(
              "absolute top-[50%] translate-y-[-50%] right-[20px] flex items-center h-10 cursor-pointer",
              suffix ? "right-[45px]" : "right-[20px]",
              suffixClassName
            )}
            onClick={() => {
              onChange &&
                onChange({
                  target: {
                    value: "",
                  },
                } as any);
            }}
          >
            <svg
              height="20"
              width="20"
              viewBox="0 0 20 20"
              aria-hidden="true"
              focusable="false"
              className="fill-current text-[rgba(0,0,0,0.25)] hover:text-[rgba(0,0,0,0.5)] transition-all"
            >
              <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
            </svg>
          </span>
        )}
      </div>
    );
  }
);
CustomInput.displayName = "CustomInput";
export default CustomInput;
