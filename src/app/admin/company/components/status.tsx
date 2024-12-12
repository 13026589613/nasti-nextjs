import {
  ADMIN_USER_STATUS,
  ADMIN_USER_STATUS_COLOR,
} from "@/constant/statusConstants";
import { cn } from "@/lib/utils";

export default function AdminUserStatus(props: {
  status: keyof typeof ADMIN_USER_STATUS;
}) {
  return (
    <div
      className={cn(
        `h-[28px] min-w-fit max-w-fit px-[12px] rounded-[14px] text-[#919FB4] text-[14px] font-[390] leading-[28px] whitespace-nowrap`,
        ADMIN_USER_STATUS_COLOR[props.status]
      )}
    >
      {ADMIN_USER_STATUS[props.status]}
    </div>
  );
}
