"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import PageContainer from "@/components/PageContainer";
import useAppStore from "@/store/useAppStore";

import ScheduleIndex from "../currentSchedule/components";
import IndexPage from "./component/index";
import { SchedulePlannerVo } from "./type";

export default function SchedulePlanner() {
  const params = useSearchParams();
  const paramsType = Number(params.get("type"));
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  const [isChild, setIsChild] = useState(false);
  const [currentItem, setCurrentItem] = useState<{
    startDate: string;
    endDate: string;
  }>();
  const [type, setType] = useState(1); // default view look 1,2 edit
  const pageRef = useRef();
  useEffect(() => {
    if (paramsType && startDate && endDate) {
      setType(paramsType);
      setCurrentItem({
        startDate: startDate || "",
        endDate: endDate || "",
      });
      setIsChild(true);
    } else {
      setType(1);
      setCurrentItem({
        startDate: "",
        endDate: "",
      });
      setIsChild(false);
    }
  }, [paramsType]);

  function handleOpenSchedule(row: SchedulePlannerVo, type: number) {
    setType(type);
    setCurrentItem(row);
    setIsChild(true);
  }
  function handleRefresh() {
    setIsChild(false);
    const current: any = pageRef.current;
    if (current) {
      setTimeout(() => {
        current.getList();
      }, 100);
    }
  }

  useEffect(() => {
    useAppStore.getState().setIsNavbarDisabled(isChild);
  }, [isChild]);

  return (
    <PageContainer className="min-w-[1200px]">
      {isChild && (
        <ScheduleIndex
          handleRefresh={() => {
            handleRefresh();
          }}
          type={type}
          currentItem={currentItem}
        />
      )}
      <div className={`${isChild && "hidden"}`}>
        <IndexPage
          ref={pageRef}
          setIsChild={setIsChild}
          handleOpenSchedule={handleOpenSchedule}
        />
      </div>
    </PageContainer>
  );
}
