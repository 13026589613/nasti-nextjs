import CustomButton from "@/components/custom/Button";
import { cn } from "@/lib/utils";

interface DoButtonProps {
  onClick: (value: string) => void;
  className?: string;
  currentBtn: string;
  btnLoading: boolean;
  clickBtn: string;
  messageLoading?: boolean;
}
export default function DoButton({
  onClick,
  className,
  currentBtn,
  btnLoading,
  clickBtn,
}: DoButtonProps) {
  return (
    <>
      <div className={cn("flex items-center", className)}>
        <div className="flex  flex-1">
          <div className="flex items-center gap-x-[20px] flex-1 justify-end">
            {currentBtn != "Inactive" && (
              <CustomButton
                colorStyle="pink"
                icon="uploadIcon"
                onClick={() => onClick("upload")}
                loading={clickBtn == "upload" && btnLoading}
              >
                Upload Employee List
              </CustomButton>
            )}

            {(currentBtn == "Active" || currentBtn == "Inactive") && (
              <CustomButton
                colorStyle="shallowZi"
                icon="bulkEditIcon"
                onClick={() => onClick("edit")}
              >
                Bulk Edit
              </CustomButton>
            )}
            {currentBtn != "Active" && currentBtn != "Inactive" && (
              <CustomButton
                colorStyle="yellow73"
                icon="inviteIcon"
                loading={clickBtn == "send" && btnLoading}
                onClick={() => onClick("send")}
              >
                Send Invite
              </CustomButton>
            )}
            {currentBtn != "Inactive" && (
              <CustomButton icon="add" onClick={() => onClick("add")}>
                Add
              </CustomButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
