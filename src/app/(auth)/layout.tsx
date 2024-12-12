"use client";
import { cn } from "@/lib/utils";
import { isFirefox } from "@/utils/getBrowserInformation";
import LoginLogo from "~/images/login_logo.svg";

import CarouselLayout from "./components/carousel";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isFirefoxB = isFirefox();
  return (
    <div className="h-full flex overflow-auto">
      <div className="shrink-0 relative w-[990px] h-full overflow-hidden bg-[url('/images/login_bgc_.png')] bg-right bg-no-repeat bg-cover hidden login:block">
        <div className="absolute left-[40px] top-[50%] translate-y-[-50%]">
          <LoginLogo className="absolute left-[260px] top-[-180px] w-[248px] h-[138px]"></LoginLogo>
          <CarouselLayout></CarouselLayout>
          <div
            className={cn(
              " absolute top-[-1px] right-[0px] transform -rotate-[180deg] w-0 h-0 border-l-[188px] border-transparent border-t-[264px]",
              isFirefoxB ? "border-l-[#EB1DB2]" : "border-l-[#EB1DB2]"
            )}
          >
            <div className=" absolute bottom-[0px] right-[44px] transform -rotate-[0deg] w-0 h-0 border-l-[146px] border-transparent border-t-[208px] border-l-[#fff] dark:border-l-[#121212]"></div>
          </div>
          <div
            className={cn(
              " absolute  right-[-34px] transform -rotate-[90deg] w-0 h-0 border-l-[252px] border-transparent border-t-[184px]",
              isFirefoxB
                ? "border-l-[#EB1DB2] bottom-[33px]"
                : "border-l-[#EB1DB2] bottom-[34px]"
            )}
          >
            <div
              className={cn(
                " absolute bottom-[-1px] transform -rotate-[0deg] w-0 h-0 border-l-[200px] border-transparent border-t-[143px] border-l-[#fff] dark:border-l-[#121212]",
                isFirefoxB ? "right-[54px]" : "right-[55px]"
              )}
            ></div>
          </div>
        </div>
      </div>
      <div className="h-full select-none min-w-[527px] w-full">{children}</div>
    </div>
  );
}
