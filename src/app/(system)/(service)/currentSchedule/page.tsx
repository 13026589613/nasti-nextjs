"use client";

import PageContainer from "@/components/PageContainer";

import ScheduleIndex from "./components";

const Page = () => {
  return (
    <PageContainer className="min-w-[1400px] relative">
      <ScheduleIndex type={4}></ScheduleIndex>
    </PageContainer>
  );
};

export default Page;
