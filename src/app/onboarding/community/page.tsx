"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import CommunityInfo from "@/app/(system)/(service)/community/create/communityInfo/index";
import DepartmentPage from "@/app/(system)/(service)/community/create/department";
// import LocationPage from "@/app/(system)/(service)/community/create/location";
import ScheduleRules from "@/app/(system)/(service)/community/create/scheduleRules";
import WorkerRolePage from "@/app/(system)/(service)/community/create/workerRole";
import ArrowStepbar from "@/components/custom/ArrowStepbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useUserStore from "@/store/useUserStore";
import CommunityLogo from "~/icons/CommunityLogo.svg";

export default function Communities() {
  const router = useRouter();

  const { operateCommunity } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const { step } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const [communityId, setCommunityId] = useState("");
  const [index, setIndex] = useState(1);
  const list = [
    {
      label: "Community Info",
      key: 1,
    },
    {
      label: "Departments",
      key: 2,
    },
    {
      label: "Roles",
      key: 3,
    },
    {
      label: "Schedule Rules",
      key: 4,
    },
  ];

  const handleSetStepIndex = (index: number) => {
    useAppStore.getState().setStep(index);
    setIndex(index);
  };

  const handleOnBoardingFinish = (id: string) => {
    setCommunityId(id);
  };

  function handleStep(index: number) {}
  useEffect(() => {
    setIndex(step);

    // load community from backend
    if (operateCommunity && !operateCommunity.isConfirmed) {
      handleOnBoardingFinish(operateCommunity.id as string);
    }

    window.localStorage.removeItem("UPLOAD_IMG");
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div className="h-[100vh] min-w-[1200px] overflow-y-auto">
      <ScrollArea
        ref={scrollRef}
        className={cn(
          "w-[1300px] h-full px-5 ml-[auto] mr-[auto] overflow-auto pr-4"
        )}
      >
        {/* onboard has logo */}
        <div className="flex items-center mb-12 mt-[30px]">
          <CommunityLogo />
          <span className="h-[42px] w-[2px] bg-[var(--primary-color)] mx-[33px]" />
          <span className="font-[450] text-[18] text-[rgba(0,0,0,0.85)]">
            Community Onboarding Wizard
          </span>
        </div>
        {/* <div className="font-[450] text-[#324664] text-[24px] mb-[30px]">
          {list[index - 1].label}
        </div> */}
        <div>
          <ArrowStepbar data={list} index={index} onClick={handleStep} />
        </div>
        <div className={cn("w-full", index === 5 && "h-[calc(100%-132px)]")}>
          {index === 1 && (
            <CommunityInfo
              buttonClassName={"bottom-[6px]"}
              communityId={communityId}
              setCommunityId={handleOnBoardingFinish}
              setIndex={handleSetStepIndex}
              pageIndex={index}
            />
          )}
          {index === 2 && communityId && (
            <DepartmentPage
              communityId={communityId}
              setIndex={handleSetStepIndex}
              pageIndex={index}
              isHiddenBtn={false}
            />
          )}
          {index === 3 && communityId && (
            <WorkerRolePage
              communityId={communityId}
              setIndex={handleSetStepIndex}
              pageIndex={index}
            />
          )}
          {index === 4 && communityId && (
            <ScheduleRules
              scrollRef={scrollRef}
              afterSave={() => {
                router.push("/employees");
                useUserStore.getState().setIsOnboarding(true);
                useAppStore.getState().setIsRefreshAuth(true);
              }}
              setIndex={handleSetStepIndex}
              communityId={communityId}
              pageIndex={index}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
