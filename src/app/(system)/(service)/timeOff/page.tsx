"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { getTimeOffList } from "@/api/timeOff";
import { PaginationType } from "@/api/types";
import CustomTable, { RefProps } from "@/components/custom/Table";
import Tabs from "@/components/custom/Tabs";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";

import MultipleReviewTimeOffDia from "./components/MultipleReviewTimeOff";
import ReviewTimeOffDia from "./components/ReviewTimeOff";
import TableSearchForm, { SearchParams } from "./components/SearchForm";
import useReturnTimeOffTableColumn from "./hooks/tableColumn";
import { TimeOffStatus, TimeOffVo } from "./types";

export default function TimeOff() {
  const { communityId } = useGlobalCommunityId();
  const { departmentIds } = useGlobalDepartment();

  const [currentView, setCurrentView] = useState("request");

  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    firstName: "",
    lastName: "",
    roleId: "",
    startDate: null,
    endDate: null,
  });

  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 15,
  });

  const [timeOffData, setTimeOffData] = useSetState<{
    data: TimeOffVo[];
    loading: boolean;
  }>({
    data: [],
    loading: false,
  });

  const tableRef = useRef<RefProps>(); // Table ref

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const clickIcon = (icon: string, data: TimeOffVo, timeOffId?: string) => {
    if (icon === "view") {
      setCurrentViewInfo({
        data,
        type: "view",
        open: true,
      });
    } else if (icon === "review") {
      setCurrentViewInfo({
        data,
        type: "review",
        open: true,
        timeOffId,
      });
    }
  };

  const { columns, columnsLess } = useReturnTimeOffTableColumn({
    selectedRows,
    setSelectedRows,
    clickIcon,
  });

  const [currentViewInfo, setCurrentViewInfo] = useSetState<{
    data: TimeOffVo | null;
    type: "review" | "view";
    open: boolean;
    timeOffId?: string;
  }>({
    data: null,
    type: "review",
    open: false,
  });

  const [multipleReviewDia, setMultipleReviewDia] = useSetState<{
    open: boolean;
    type: TimeOffStatus;
  }>({
    open: false,
    type: "REJECTED",
  });

  const checkFn = (type: TimeOffStatus) => {
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one record.");
    } else {
      if (type == "REJECTED") {
        setMultipleReviewDia({
          open: true,
          type: "REJECTED",
        });
      } else {
        setMultipleReviewDia({
          open: true,
          type: "APPROVED",
        });
      }
    }
  };

  const getTimeOffListFn = async () => {
    setTimeOffData({
      loading: true,
    });
    canClickTab.current = false;
    try {
      const { startDate, endDate, firstName, lastName, roleId } = searchParams;
      const res = await getTimeOffList({
        communityId: communityId,
        status:
          currentView === "request" ? ["PENDING"] : ["APPROVED", "REJECTED"],
        departmentIds: departmentIds,
        startFromDate: startDate ? startDate[0] : null,
        startToDate: startDate ? startDate[1] : null,
        endFromDate: endDate ? endDate[0] : null,
        endToDate: endDate ? endDate[1] : null,
        firstName,
        lastName,
        workerRoleId: roleId,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      });

      if (res.code === 200) {
        setTimeOffData({
          data: res.data.records ?? [],
        });
        setPagination({
          total: res.data.total,
        });
      }
    } finally {
      setTimeOffData({
        loading: false,
      });
      canClickTab.current = true;
    }
  };

  useEffect(() => {
    getTimeOffListFn();
  }, [pagination.pageNum, pagination.pageSize, currentView, departmentIds]);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.clearSelectedRows();
    }
  }, [currentView]);

  useEffect(() => {
    if (pagination.pageNum === 1) {
      getTimeOffListFn();
    } else {
      setPagination({
        pageNum: 1,
      });
    }
  }, [searchParams]);

  const canClickTab = useRef(true);

  return (
    <PageContainer className="min-w-[1400px] relative">
      <PageTitle title="Time Off" isClose={false} />
      <Tabs
        className="mt-[30px]"
        items={[
          {
            label: "Time Off Requests",
            key: "request",
          },
          {
            label: "Request History",
            key: "history",
          },
        ]}
        defaultActiveKey={currentView}
        isChangeActive={false}
        onclick={(key: string) => {
          if (canClickTab.current) {
            if (key !== currentView) {
              setCurrentView(key);
            } else {
              getTimeOffListFn();
            }
          }
        }}
      />
      <TableSearchForm
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        checkFn={checkFn}
        currentView={currentView}
      ></TableSearchForm>
      <CustomTable
        columns={currentView === "request" ? columnsLess : columns}
        data={timeOffData.data}
        // loading={loading.tableLoading}
        loading={timeOffData.loading}
        adaptive
        ref={tableRef}
        pagination={pagination}
        changePageNum={(pageNum) => {
          setPagination({ pageNum });
        }}
        changePageSize={(pageSize) => {
          const nowSize = pagination.pageSize * (pagination.pageNum - 1) + 1;

          const pageNum = Math.ceil(nowSize / pageSize);

          setPagination({ ...pagination, pageSize, pageNum: pageNum });
        }}
      />
      {multipleReviewDia.open && (
        <MultipleReviewTimeOffDia
          type={multipleReviewDia.type}
          selectedRows={timeOffData.data.filter((item) =>
            selectedRows.includes(item.id)
          )}
          onClose={() => setMultipleReviewDia({ open: false })}
          onSuccess={() => {
            getTimeOffListFn();
          }}
        ></MultipleReviewTimeOffDia>
      )}
      {currentViewInfo.open && (
        <ReviewTimeOffDia
          data={currentViewInfo.data}
          type={currentViewInfo.type}
          timeOffId={currentViewInfo.timeOffId}
          onClose={() => {
            setCurrentViewInfo({
              open: false,
            });
          }}
          onSuccess={() => {
            getTimeOffListFn();
          }}
        ></ReviewTimeOffDia>
      )}
    </PageContainer>
  );
}
