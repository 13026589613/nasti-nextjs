import { forwardRef } from "react";

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
}
const BottomButton = (props: CommunityButtonProps, ref: any) => {
  const { isOnboarding } = useUserStore.getState();
  const { onClick, onCancel, onPrevious, loading, type, pathIndex, className } =
    props;
  return (
    <div
      className={`${className} text-right space-x-[39px] mt-[20px]`}
      ref={ref}
    >
      {pathIndex !== 1 && (
        <span
          className="w-[100px] h-[60px] font-[390] text-[16px] text-[var(--yellow)] cursor-pointer flex items-center justify-center "
          onClick={() => {
            onPrevious && onPrevious();
          }}
        >
          Previous
        </span>
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
        type={type}
        className="w-[160px]"
        onClick={() => {
          onClick && onClick();
        }}
      >
        Next
      </Button>
    </div>
  );
};
export default forwardRef(BottomButton);
