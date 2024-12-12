"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { setOperateCommunity } from "@/api/user";
import ArrowStepbar from "@/components/custom/ArrowStepbar";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useUserStore from "@/store/useUserStore";

import CommunityInfo from "./communityInfo";
import DepartmentPage from "./department";
import ScheduleRules from "./scheduleRules";
import RolePage from "./workerRole";

export default function Communities() {
  const { operateCommunity } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const router = useRouter();

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
    // {
    //   label: "Location",
    //   key: 3,
    // },
    {
      label: "Roles",
      key: 3,
    },
    {
      label: "Schedule Rules",
      key: 4,
    },
  ];

  function handleStep(index: number) {}

  useEffect(() => {
    window.localStorage.removeItem("UPLOAD_IMG");
  }, [operateCommunity]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const setOperateCommunityFn = async (communityId: string | undefined) => {
    const res = await setOperateCommunity(communityId as string);
    if (res.code === 200) {
      useUserStore.getState().setIsOnboarding(true);
      useAppStore.getState().setIsRefreshAuth(true);
      router.push("/myCommunity");
    }
  };

  return (
    <PageContainer className="min-w-[1200px]">
      <ScrollArea
        ref={scrollRef}
        className={cn("w-full h-full px-5 ml-[auto] mr-[auto]")}
      >
        <PageTitle
          className="mb-[30px]"
          title="Add Community"
          isClose={false}
        />
        <div>
          <ArrowStepbar data={list} index={index} onClick={handleStep} />
        </div>
        {index != 4 && (
          <div className={cn("h-[calc(100%-132px)]")}>
            {index === 1 && (
              <CommunityInfo
                communityId={communityId}
                setCommunityId={setCommunityId}
                setIndex={setIndex}
                pageIndex={index}
              />
            )}
            {index === 2 && communityId && (
              <DepartmentPage
                communityId={communityId}
                setIndex={setIndex}
                pageIndex={index}
              />
            )}
            {/* {index === 3 && communityId && (
            <LocationPage
              communityId={communityId}
              setIndex={setIndex}
              pageIndex={index}
            />
          )} */}
            {index === 3 && communityId && (
              <RolePage
                communityId={communityId}
                setIndex={setIndex}
                pageIndex={index}
              />
            )}
            {index === 4 && communityId && (
              <ScheduleRules
                scrollRef={scrollRef}
                afterSave={() => {
                  // router.push("/myCommunity");
                }}
                setIndex={setIndex}
                communityId={communityId}
                pageIndex={index}
              />
            )}
          </div>
        )}
        {index === 4 && (
          <div className="h-[calc(100vh-316px)]">
            <ScheduleRules
              isCreate={true}
              scrollRef={scrollRef}
              afterSave={(communityId) => {
                setOperateCommunityFn(communityId);
              }}
              setIndex={setIndex}
              communityId={communityId}
              pageIndex={index}
            />
          </div>
        )}
      </ScrollArea>
    </PageContainer>
  );
}
