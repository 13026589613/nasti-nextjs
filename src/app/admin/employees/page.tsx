"use client";

import { useEffect, useRef, useState } from "react";

import PageContainer from "@/components/PageContainer";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";

import PageList from "./component/pageList";
import TimeOffList from "./component/timeOffList";
import { EmployeesVo } from "./type";

export default function Employees() {
  const [isChild, setIsChild] = useState(false);
  const pageListRef = useRef(null);
  const [editData, setEditData] = useState<EmployeesVo | null>(null);
  const [isView, setIsView] = useState(false);

  const { communityId } = useGlobalCommunityId();

  function refreshList(): void {
    const current: any = pageListRef.current;
    if (current) {
      current.getList();
    }
  }

  useEffect(() => {
    setIsChild(false);
  }, [communityId]);

  const [isFocus, setIsFocus] = useState(false);

  return (
    <PageContainer className="min-w-[1200px]">
      {isChild && (
        <div className={`${!isChild && "hidden"}`}>
          <TimeOffList
            setIsChild={setIsChild}
            refreshList={refreshList}
            editData={editData}
            isFocus={isFocus}
            isView={isView}
          />
        </div>
      )}

      <div className={`${isChild && "hidden"}`}>
        <PageList
          isFocus={isFocus}
          isChild={isChild}
          setIsChild={setIsChild}
          ref={pageListRef}
          getEditData={(value: EmployeesVo) => {
            setEditData(value);
          }}
          setIsView={(value) => {
            setIsView(value);
          }}
          setIsEmployeeInfo={(value) => {
            setIsChild(value);
          }}
          setIsFocus={setIsFocus}
        ></PageList>
      </div>
    </PageContainer>
  );
}
