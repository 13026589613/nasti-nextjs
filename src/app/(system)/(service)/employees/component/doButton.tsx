import { useShallow } from "zustand/react/shallow";

import AuthProvide from "@/components/custom/Auth";
import CustomButton from "@/components/custom/Button";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/useAuthStore";
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
  messageLoading,
}: DoButtonProps) {
  const { permission } = useAuthStore(
    useShallow((state: any) => ({
      ...state,
    }))
  );
  return (
    <>
      <div className={cn("flex items-center", className)}>
        {currentBtn == "Active" && (
          <div>
            <CustomButton
              colorStyle="green97"
              icon="messageIcon"
              onClick={() => onClick("message")}
              loading={messageLoading}
            >
              Message
            </CustomButton>
          </div>
        )}
        <div className="flex  flex-1">
          <div className="flex items-center gap-x-[20px] flex-1 justify-end">
            {currentBtn != "Inactive" && (
              <>
                <AuthProvide permissionName="EMPLOYEE_MANAGEMENT_ADD">
                  <CustomButton
                    colorStyle="pink"
                    icon="uploadIcon"
                    onClick={() => onClick("upload")}
                    loading={clickBtn == "upload" && btnLoading}
                  >
                    Upload Employee List
                  </CustomButton>
                </AuthProvide>
              </>
            )}

            {(currentBtn == "Active" || currentBtn == "Inactive") && (
              <AuthProvide permissionName="EMPLOYEE_MANAGEMENT_EDIT">
                <CustomButton
                  colorStyle="shallowZi"
                  icon="bulkEditIcon"
                  onClick={() => onClick("edit")}
                >
                  Bulk Edit
                </CustomButton>
              </AuthProvide>
            )}
            {currentBtn != "Active" && currentBtn != "Inactive" && (
              <>
                {permission.includes("EMPLOYEE_MANAGEMENT_ADD") ||
                permission.includes("EMPLOYEE_MANAGEMENT_EDIT") ? (
                  <CustomButton
                    colorStyle="yellow73"
                    icon="inviteIcon"
                    loading={clickBtn == "send" && btnLoading}
                    onClick={() => onClick("send")}
                  >
                    Send Invite
                  </CustomButton>
                ) : (
                  ""
                )}
              </>
            )}
            {currentBtn != "Inactive" && (
              <AuthProvide permissionName="EMPLOYEE_MANAGEMENT_ADD">
                <CustomButton icon="add" onClick={() => onClick("add")}>
                  Add
                </CustomButton>
              </AuthProvide>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
