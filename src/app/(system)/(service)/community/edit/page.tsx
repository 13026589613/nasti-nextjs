"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { useShallow } from "zustand/react/shallow";

import { getCommunityIsConfirm } from "@/api/community";
import Spin from "@/components/custom/Spin";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useUserStore from "@/store/useUserStore";

import AdminUserIndex from "../../adminUser/components/adminUserIndex";
import CommunityInfo from "../create/communityInfo";
import DepartmentPage from "../create/department";
import LocationPage from "../create/location";
import ScheduleRules from "../create/scheduleRules";
import WorkerRolePage from "../create/workerRole";

interface TabsProps {
  label: string;
  key: number;
}

export default function CommunityEdit() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(1);
  const [communityId, setCommunityId] = useState("");

  // const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmInfo, setConfirmInfo] = useImmer({
    departmentData: false,
    rolesData: false,
    scheduleRulesData: false,
  });

  const tabs: TabsProps[] = [
    {
      label: "Community Info",
      key: 1,
    },
    // {
    //   label: "Admin Users",
    //   key: 2,
    // },
    {
      label: "Departments",
      key: 3,
    },
    {
      label: "Locations",
      key: 4,
    },
    {
      label: "Roles",
      key: 5,
    },
    {
      label: "Schedule Rules",
      key: 6,
    },
  ];

  const { operateCommunity } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const getCommunityIsConfirmFn = async () => {
    setLoading(true);
    try {
      const res = await getCommunityIsConfirm(operateCommunity.id as string);
      if (res.code === 200) {
        setConfirmInfo(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = params.get("id");
    if (id) {
      setCommunityId(id);
    }
    if (operateCommunity && operateCommunity.id !== communityId) {
      setCommunityId(operateCommunity.id as string);
      if (operateCommunity.id) {
        getCommunityIsConfirmFn();
      }
    }
  }, [operateCommunity, communityId]);

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <PageContainer contentClassName="pb-0" className="min-w-[1200px]">
      <Spin loading={loading}>
        <div
          className={cn(
            "w-full h-[calc(100vh-130px)] overflow-hidden ",
            index === 6 && "h-full"
          )}
        >
          <PageTitle
            className="mb-6"
            title="Community Settings"
            isClose={false}
          />
          <div className="relative h-[48px] w-full pb-[7px] border-b border-[#E7EDF1]">
            <div className="flex items-center justify-start h-[40px] w-full">
              {tabs.map((tab) => (
                <div
                  key={tab.key}
                  onClick={() => {
                    setIndex(tab.key);
                  }}
                  className="relative"
                >
                  <div
                    className={cn(
                      "px-[20px] cursor-pointer  text-[18px] font-[450] text-center leading-10",
                      tab.key === index ? "text-[#EB1DB2]" : "text-[#000000A6]"
                    )}
                  >
                    {tab.label}
                  </div>
                  {tab.key === index && (
                    <div className="absolute bottom-[-7px] w-full h-[2px] bg-[#EB1DB2]"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {index !== 6 && (
            <div
              ref={scrollRef}
              className="w-full h-[calc(100%-120px)] px-5 overflow-hidden relative"
            >
              {index === 1 && !loading && (
                <CommunityInfo
                  className="pb-[80px]"
                  communityId={communityId}
                  setCommunityId={setCommunityId}
                  setIndex={setIndex}
                  pageIndex={index}
                  isEdit
                />
              )}
              {index === 2 && <AdminUserIndex communityId={communityId} />}
              {index === 3 && (
                <DepartmentPage
                  communityId={communityId}
                  setIndex={setIndex}
                  pageIndex={index}
                  isHiddenBtn
                  getListCallBack={() => {
                    if (!confirmInfo.departmentData) {
                      getCommunityIsConfirmFn();
                      useAppStore
                        .getState()
                        .setIsRefreshAuthWithoutLoading(true);
                    }
                  }}
                />
              )}
              {index === 4 && (
                <LocationPage
                  communityId={communityId}
                  setIndex={setIndex}
                  pageIndex={index}
                  isHiddenBtn
                />
              )}
              {index === 5 && (
                <WorkerRolePage
                  communityId={communityId}
                  setIndex={setIndex}
                  pageIndex={index}
                  isHiddenBtn
                  getListCallBack={() => {
                    if (!confirmInfo.rolesData) {
                      getCommunityIsConfirmFn();
                      useAppStore
                        .getState()
                        .setIsRefreshAuthWithoutLoading(true);
                    }
                  }}
                />
              )}
            </div>
          )}

          {index === 6 && (
            <ScrollArea
              ref={scrollRef}
              className="w-full h-[calc(100vh-232px)] px-5"
            >
              <ScheduleRules
                scrollRef={scrollRef}
                afterSave={() => {
                  if (!confirmInfo.scheduleRulesData) {
                    getCommunityIsConfirmFn();
                    useAppStore.getState().setIsRefreshAuthWithoutLoading(true);
                  }
                }}
                setIndex={setIndex}
                communityId={communityId}
                pageIndex={index}
                isEdit
              />
            </ScrollArea>
          )}
        </div>
      </Spin>
    </PageContainer>
  );
}
