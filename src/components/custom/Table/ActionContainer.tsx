import { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import ApplyTemplateIcon from "~/icons/ApplyTemplateIcon.svg";
import DeleteIcon from "~/icons/DeleteIcon.svg";
import DuplicateIcon from "~/icons/DuplicateIcon.svg";
import EditIcon from "~/icons/EditIcon.svg";
import OpenEyeFillIcon from "~/icons/OpenEyeFillIcon.svg";

import Tooltip from "../Tooltip";

type iconType = "edit" | "delete" | "view" | "copy" | "applyTemplate";

type Action = {
  content?: string;
  name: iconType;
  onClick?: () => void;
  className?: CSSProperties;
  isHide?: boolean;
};

interface ActionContainerProps {
  actions: Action[];
}

const icons = {
  edit: <EditIcon width="16px" height="16px" color="#d838ae" />,
  delete: <DeleteIcon width="16px" height="16px" color="#13227A" />,
  copy: <DuplicateIcon width="16px" height="16px" color="#6CDA84" />,
  view: <OpenEyeFillIcon width="16px" height="16px" color="#68B7B0" />,
  applyTemplate: (
    <ApplyTemplateIcon width="16px" height="16px" color="#29D6D6" />
  ),
};

const ActionContainer = (props: ActionContainerProps) => {
  const { actions } = props;

  return (
    <div className="flex justify-center items-center gap-5">
      {actions.map(({ name, content, className, isHide, onClick }, i) => {
        if (isHide) {
          return <div key={i} className="hidden"></div>;
        }
        return (
          <div key={i}>
            <Tooltip content={content}>
              <div
                className={cn("cursor-pointer", className)}
                onClick={onClick}
              >
                {icons[name]}
              </div>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

export default ActionContainer;
