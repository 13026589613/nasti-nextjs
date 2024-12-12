import { forwardRef } from "react";
import { toast } from "react-toastify";

import Button from "@/components/custom/Button";
import useUserStore from "@/store/useUserStore";

interface CommunityButtonProps {
  onClick?: () => void;
  onCancel?: () => void;
  onPrevious?: () => void;
  pathIndex: number;
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
  const { isOnboarding } = useUserStore.getState();
  const {
    isDisabled,
    onClick,
    onCancel,
    onPrevious,
    loading,
    type,
    pathIndex,
    className,
    errorMsg,
    isEdit = false,
    isHiddenBtn = false,
  } = props;
  return (
    <div className={`${className} text-right space-x-[39px]`} ref={ref}>
      {isEdit && !isHiddenBtn && (
        <>
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
                onClick && onClick();
              }
            }}
          >
            Save
          </Button>
        </>
      )}
      {!isEdit && !isHiddenBtn && (
        <>
          {pathIndex !== 1 && (
            <div
              className="w-[100px] h-[60px] font-[390] text-[16px] text-[var(--yellow)] cursor-pointer flex items-center justify-center "
              onClick={() => {
                onPrevious && onPrevious();
              }}
            >
              Previous
            </div>
          )}

          {isOnboarding && pathIndex === 1 && (
            <Button
              type="button"
              className="w-[160px]"
              variant="outline"
              onClick={() => {
                onCancel && onCancel();
              }}
            >
              Cancel
            </Button>
          )}

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
                onClick && onClick();
              }
            }}
          >
            Next
          </Button>
        </>
      )}
    </div>
  );
};
export default forwardRef(CommunityButton);
