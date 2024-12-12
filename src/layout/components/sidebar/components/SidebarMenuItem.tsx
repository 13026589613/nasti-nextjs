import { usePathname, useRouter } from "next/navigation";
import { cloneElement, ReactElement } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import NumberCircle from "@/components/custom/NumberCircle";
import CustomTooltip from "@/components/custom/Tooltip";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useTokenStore from "@/store/useTokenStore";
import useUserStore from "@/store/useUserStore";

interface SidebarMenuItemProps {
  icon: ReactElement;
  title: string;
  isCollapse: boolean;
  link: string;
  included: string[];
  unRead?: number | null;
}

const SidebarMenuItem = (props: SidebarMenuItemProps) => {
  const { icon, title, isCollapse, link, included, unRead } = props;
  const pathname = usePathname();

  const route = useRouter();

  const { operateCommunity } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const isSuperAdmin = useTokenStore((state) => state.isSuperAdmin);

  const forbiddenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    toast.warning("Please complete the Community information.", {
      position: "top-center",
    });
  };

  return (
    <>
      {!isSuperAdmin &&
      !operateCommunity.isConfirmed &&
      title !== "Community Settings" ? (
        <div
          className={cn(
            "flex items-center h-[50px] text-[#919FB4] cursor-not-allowed relative",
            included.includes(pathname)
              ? "text-primary bg-[#F2F5FD] border-l-4 border-[#EB1DB2]"
              : ""
          )}
          onClick={forbiddenClick}
        >
          {isCollapse ? (
            <div className={cn("flex justify-center w-[100%]")}>
              <CustomTooltip content={title}>
                {cloneElement(icon, {
                  width: 24,
                  height: 24,
                })}
              </CustomTooltip>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  included.includes(pathname) ? "ml-[20px]" : "ml-[24px]"
                )}
              >
                {cloneElement(icon, {
                  width: 18,
                  height: 18,
                })}
              </div>
              <div className="ml-[22px] whitespace-nowrap">{title}</div>
            </>
          )}
          <div className="absolute w-full h-full bg-cyan-50 opacity-20"></div>
        </div>
      ) : (
        <div
          // href={link}
          onClick={() => {
            if (pathname === link) {
              useAppStore.getState().setIsRefreshMenu(true);
              useAppStore.getState().setIsRefreshInner(true);
            }
            if (link != "/") {
              route.push(link);
            }
          }}
          className={cn(
            "flex items-center h-[50px] text-[#919FB4]  hover:text-primary hover:bg-[#F2F5FD] cursor-pointer ",
            included.includes(pathname)
              ? "text-primary bg-[#F2F5FD] border-l-4 border-[#EB1DB2]"
              : ""
          )}
        >
          {isCollapse ? (
            <div className={cn("flex justify-center w-[100%]")}>
              <CustomTooltip isStopPropagation={false} content={title}>
                <div
                  className={cn(
                    "w-6 h-6 relative",
                    included.includes(pathname) ? "mr-[4px]" : ""
                  )}
                >
                  {cloneElement(icon, {
                    width: 24,
                    height: 24,
                  })}
                  {unRead && unRead > 0 && (
                    <NumberCircle number={unRead}></NumberCircle>
                  )}
                </div>
              </CustomTooltip>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "w-[24px] h-[18px] flex justify-start ml-[24px]",
                  included.includes(pathname) ? "ml-[20px]" : "ml-[24px]"
                )}
              >
                {cloneElement(icon, {
                  width: 18,
                  height: 18,
                })}
              </div>
              <div className="relative ml-[22px] whitespace-nowrap">
                <span>{title}</span>
                {unRead && unRead > 0 && (
                  <NumberCircle number={unRead}></NumberCircle>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SidebarMenuItem;
