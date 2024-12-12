import { forwardRef } from "react";
import { toast } from "react-toastify";

import Button from "@/components/custom/Button";

interface CommunityButtonProps {
  onClick?: () => void;
  onCancel?: () => void;
  onPrevious?: () => void;
  loading?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
  ref?: React.ReactHTML;
  className: string;
  isDisabled?: boolean;
  errorMsg?: string;
  isEdit?: boolean;
  isHiddenBtn?: boolean;
}
const CommunityButton = (props: CommunityButtonProps, ref: any) => {
  const { isDisabled, onClick, loading, type, className, errorMsg } = props;
  return (
    <div className={`${className} text-right space-x-[39px]`} ref={ref}>
      <div className="mb-5">
        <Button
          loading={loading}
          type={isDisabled ? "button" : type}
          className={`w-[160px] ${
            isDisabled ? "bg-[#dddddd] text-[#fff]" : ""
          } `}
          onClick={() => {
            if (isDisabled) {
              toast.error(errorMsg, {
                position: "top-center",
              });
            } else {
              onClick?.();
            }
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};
export default forwardRef(CommunityButton);
