import { ReactElement } from "react";
import ReactDOM from "react-dom";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuestionIcon from "~/icons/QuestionIcon.svg";
interface TooltipProps {
  children?: React.ReactNode;
  content?: string | ReactElement;
  icon?: string;
  color?: string;
  onClick?: Function;
  classContentName?: any;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  isStopPropagation?: boolean;
}

const iconList: any = {
  help: <QuestionIcon color="var(--primary-color)" />,
};

const styleVar: any = {
  baseColor: "var(--primary-color)",
  purple: "var(--Purple)",
  shadowGreen: "var(--shadowGreen)",
  shadowBlue: "var(--shadowBlue)",
  shadowPrimary: "var(--shadowPrimary)",
  shallowGreen: "var(--shallowGreen)",
  pink: "var(--pink)",
  shadowYellow: "var(--shadowYellow)",
  yellow: "var(--yellow)",
};

export default function CustomTooltip({
  content,
  icon,
  color,
  onClick,
  children,
  classContentName,
  open,
  side,
  align,
  onOpenChange,
  isStopPropagation = true,
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild={false}>
          <span
            className="flex items-center"
            style={{
              color: `${color && styleVar[color]}`,
            }}
            onClick={(event) => {
              if (isStopPropagation) {
                event.preventDefault();
                event.stopPropagation();
              }

              onClick && onClick();
            }}
          >
            {icon && iconList[icon] ? (
              <span className="mr-[5px]">{iconList[icon]}</span>
            ) : (
              ""
            )}
            {children}
          </span>
        </TooltipTrigger>
        {ReactDOM.createPortal(
          <TooltipContent
            side={side}
            align={align}
            className={classContentName}
          >
            {content}
          </TooltipContent>,
          document.body
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
