import { cn } from "@/lib/utils";
import NoDataDeptIcon from "~/icons/NoDataDeptIcon.svg";
import NoDataIcon from "~/icons/NoDataIcon.svg";
import NoDataLocationIcon from "~/icons/NoDataLocationIcon.svg";
import RolesIcon from "~/icons/RolesIcon.svg";
interface NotDataProps {
  description?: string;
  className?: string;
  descriptionClassName?: string;
  icon?: string;
}
export default function NotData({
  description,
  className,
  descriptionClassName,
  icon,
}: NotDataProps) {
  const iconList: any = {
    noDataDeptIcon: <NoDataDeptIcon />,
    noDataLocationIcon: <NoDataLocationIcon />,
    RolesIcon: <RolesIcon />,
  };
  return (
    <div
      className={cn(
        `flex flex-col items-center justify-center h-[550px]`,
        className
      )}
    >
      <div>
        <NoDataIcon />
      </div>

      <div>
        {icon && iconList[icon] ? (
          iconList[icon]
        ) : (
          <div className="text-[#EB1DB2] text-[24px] font-[390]">
            No data available
          </div>
        )}
      </div>
      {/* <div className="w-[750px] text-[16px] text-[#324664] leading-10 mt-[20px] text-center font-[390]">
        {description ? (
          <div
            className={cn(
              "text-[var(--primary-color)] font-[400] text-[24px]",
              descriptionClassName
            )}
          >
            {description}
          </div>
        ) : (
          txtVal
        )}
      </div> */}
    </div>
  );
}
