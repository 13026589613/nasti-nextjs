import { Loader2, RotateCcw } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AddIcon from "~/icons/AddIcon.svg";
import BulkDelete from "~/icons/BulkDelete.svg";
import BulkEditIcon from "~/icons/BulkEditIcon.svg";
import CalendarIcon from "~/icons/CalendarIcon.svg";
import ErrorCircle from "~/icons/ErrorCircle.svg";
import HelpIcon from "~/icons/HelpIcon.svg";
import ImportIcon from "~/icons/ImportIcon.svg";
import InviteIcon from "~/icons/InviteIcon.svg";
import MessageIcon from "~/icons/MessageIcon.svg";
import RightCircle from "~/icons/RightCircle.svg";
import SearchIcon from "~/icons/SearchIcon.svg";
import ShareIcon from "~/icons/ShareIcon.svg";
import TemplateIcon from "~/icons/TemplateIcon.svg";
import TwoCicleIcon from "~/icons/TwoCicleIcon.svg";
import UnpublishIcon from "~/icons/UnpublishIcon.svg";
import UploadFIleIcon from "~/icons/UploadFIleIcon.svg";
import UploadIcon from "~/icons/UploadIcon.svg";
interface ButtonProps {
  asChild?: boolean;
  ref?: any;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  colorStyle?:
    | "purple"
    | "shadowGreen"
    | "shadowBlue"
    | "shadowPrimary"
    | "shallowGreen"
    | "pink"
    | "shadowYellow"
    | "yellow"
    | "shallowZi"
    | "yellow73"
    | "green97"
    | "blue"
    | "red"
    | "green"
    | "orange"
    | undefined;
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  icon?:
    | "help"
    | "add"
    | "search"
    | "twoCicle"
    | "importIcon"
    | "uploadIcon"
    | "reset"
    | "bulkEditIcon"
    | "inviteIcon"
    | "share"
    | "addShift"
    | "messageIcon"
    | "bulkDelete"
    | "unpublishIcon"
    | "templateIcon"
    | "right"
    | "error"
    | "UploadFIleIcon";

  className?: string | object;
  disabled?: boolean;
  loading?: boolean;
  onClick?: Function;
  type?: "submit" | "reset" | "button" | undefined;
}
const iconList: any = {
  help: <HelpIcon width="12" height="12" color="white" />,
  add: <AddIcon width="12" height="12" color="white" />,
  search: <SearchIcon width="15" height="16" color="white" />,
  twoCicle: <TwoCicleIcon width="18" height="20" color="white" />,
  importIcon: <ImportIcon width="20" height="21" color="white" />,
  uploadIcon: <UploadIcon width="23" height="18" color="white" />,
  bulkEditIcon: <BulkEditIcon width="23" height="18" color="white" />,
  inviteIcon: <InviteIcon width="23" height="18" color="white" />,
  unpublishIcon: <UnpublishIcon width="23" height="18" color="white" />,
  messageIcon: <MessageIcon width="23" height="18" color="white" />,
  reset: (
    <RotateCcw width="23" height="18" className="text-accent-foreground" />
  ),
  share: <ShareIcon></ShareIcon>,
  addShift: <CalendarIcon width="16" height="16" color="white" />,
  bulkDelete: <BulkDelete width="23" height="18" color="white" />,
  templateIcon: <TemplateIcon width="23" height="18" color="white" />,
  right: <RightCircle width="18" height="18" color="white" />,
  error: <ErrorCircle width="18" height="18" color="white" />,
  UploadFIleIcon: (
    <UploadFIleIcon width="18" height="18" color="currentColor" />
  ),
};

const styleVar: any = {
  purple: "bg-[Purple]  hover:bg-[Purple]/90",
  shadowGreen: "bg-[#B7DFC4]  hover:bg-[#B7DFC4]/90",
  shadowBlue: "bg-[#BBCFEA]  hover:bg-[#BBCFEA]/90",
  shadowPrimary: "bg-[#C7C1F3]  hover:bg-[#C7C1F3]/90",
  shallowGreen: "bg-[#69CBCC]  hover:bg-[#69CBCC]/90",
  pink: "bg-[#FF9E9E]  hover:bg-[#FF9E9E]/90",
  shadowYellow: "bg-[#D37745]  hover:bg-[#D37745]/90",
  yellow: "bg-[#F5894E]  hover:bg-[#F5894E]/90",
  // green3: "bg-[Green 3]  hover:bg-[Green 3]/90",
  shallowZi: "bg-[#6147FF91]  hover:bg-[#6147FF91]/90",
  yellow73: "bg-[#CAE073]  hover:bg-[#CAE073]/90",
  green97: "bg-[#6FCF97]  hover:bg-[#6FCF97]/90",
  blue: "bg-[#5AD7CF]  hover:bg-[#5AD7CF]/90",
  red: "bg-[#EF4444]  hover:bg-[#EF4444]/90",
  green: "bg-[#3FBD6B]  hover:bg-[#3FBD6B]/90",
  orange: "bg-[#F55F4E]  hover:bg-[#F55F4E]/90",
};
const CustomButton = (props: ButtonProps) => {
  const {
    ref,
    variant,
    colorStyle,
    size,
    className,
    disabled,
    loading,
    icon,
    onClick,
    type,
    children,
  } = props;
  return (
    <Button
      disabled={disabled}
      ref={ref}
      variant={variant}
      type={type}
      size={size}
      className={cn(colorStyle && styleVar[colorStyle], "rounded", className)}
      onClick={() => {
        if (loading) return;
        onClick && onClick();
      }}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
      {icon && (
        <div className="mr-[5px]">
          {iconList[icon] ? iconList[icon] : { icon }}
        </div>
      )}
      {children}
    </Button>
  );
};
export default CustomButton;
