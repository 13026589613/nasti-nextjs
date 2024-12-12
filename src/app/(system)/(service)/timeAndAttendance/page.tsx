"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import { getTimeAndAttendanceList } from "@/api/timeAndAttendance";
import { PaginationType } from "@/api/types";
import { CheckType } from "@/app/(system)/(service)/timeAndAttendance/types";
import CheckLocationDia from "@/components/checkLocation";
import CustomTable, {
  CustomColumnDef,
  RefProps,
} from "@/components/custom/Table";
import Tabs from "@/components/custom/Tabs";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import useDepartmentStore from "@/store/useDepartmentStore";
import useMenuNumStore from "@/store/useMenuNumStore";

import ReviewShift from "./components/ReviewShift";
import TableSearchForm, { SearchParams } from "./components/SearchForm";
import ViewShift from "./components/ViewShift";
import useReturnTimeOffTableColumn from "./hooks/tableColumn";
import { ExceptionsVo } from "./types";

export type TabsKey = "history" | "exceptions";

export default function TimeAndAttendance() {
  const { UTCMoment } = useGlobalTime();
  const { communityId } = useGlobalCommunityId();
  const { departmentIds } = useGlobalDepartment();
  const { department } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const [checkType, setCheckType] = useState<CheckType>("checkin");
  const [tabsOptions] = useState([
    {
      label: "Exceptions",
      key: "exceptions",
      unread: null,
    },
    {
      label: "History",
      key: "history",
      unread: null,
    },
  ]);
  const [currentView, setCurrentView] = useState<TabsKey>("exceptions");
  const [locationInfo, setLocationInfo] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 0,
    lng: 0,
  });
  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    roleId: "",
    userId: "",
    status: "",
    date: "",
  });

  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 15,
  });

  const [listDataInfo, setListDataInfo] = useSetState({
    data: [] as ExceptionsVo[],
    loading: false,
  });

  const [currentColum, setCurrentColum] = useState<
    CustomColumnDef<ExceptionsVo>[]
  >([]);
  const [checkLocationOpen, setCheckLocationOpen] = useState<boolean>(false);
  const [ReviewInfo, setReviewInfo] = useSetState({
    visible: false,
    type: "",
    isView: false,
    data: null,
  } as {
    visible: boolean;
    type: TabsKey | "";
    isView: boolean;
    data: ExceptionsVo | null;
  });

  const clickIcon = (data: ExceptionsVo, type: "view" | "edit") => {
    if (type === "edit") {
      setReviewInfo({
        visible: true,
        type: "exceptions",
        isView: false,
        data: data,
      });
    } else if (type === "view") {
      setReviewInfo({
        visible: true,
        type: "history",
        isView: true,
        data: data,
      });
    }
  };
  const checkLocation = (data: ExceptionsVo) => {
    const type = data.attendeeType === "CHECK_OUT" ? "checkout" : "checkin";
    setCheckType(type);
    setLocationInfo(data.location);
    setCheckLocationOpen(true);
  };
  const tableRef = useRef<RefProps>(); // Table ref
  const { columns_edit, columns_view } = useReturnTimeOffTableColumn({
    clickIcon,
    checkLocation,
  });

  const getDataListFn = async () => {
    setListDataInfo({
      loading: true,
    });
    try {
      const { roleId, userId, date, status: checkType } = searchParams;
      const params = {
        communityId,
        userId,
        departmentIds: departmentIds.join(","),
        workerRoleId: roleId,
        checkType,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        shiftDate: currentView === "exceptions" ? null : date,
        status:
          currentView === "exceptions"
            ? "NEW"
            : ["APPROVED", "REQUESTED", "REJECT"].join(","),
      };

      const { code, data } = await getTimeAndAttendanceList(params);

      if (code !== 200) return;
      setPagination({
        total: data.total,
      });
      setListDataInfo({
        data: data.records.map((item) => {
          const {
            id,
            attendeeType,
            departmentId,
            departmentName,
            workerRoleName,
            attendeeUsername,
            attendeeUserId,
            startTimeUtc,
            endTimeUtc,
            checkInUtc,
            checkOutUtc,
            checkinLat,
            checkoutLat,
            checkinLng,
            checkoutLng,
            status,
            shiftId,
          } = item;
          return {
            id: id || "",
            attendeeType: attendeeType,
            departmentId: departmentId || "",
            departmentName: departmentName || "",
            workerRoleName: workerRoleName || "",
            username: attendeeUsername || "",
            userId: attendeeUserId || "",
            startTimeLocal: startTimeUtc
              ? UTCMoment(startTimeUtc).format("MM/DD/YYYY hh:mm A")
              : "",
            endTimeLocal: endTimeUtc
              ? UTCMoment(endTimeUtc).format("MM/DD/YYYY hh:mm A")
              : "",
            checkInTimeLocal: checkInUtc
              ? `${UTCMoment(checkInUtc).format("MM/DD/YYYY hh:mm A")}`
              : "",
            checkOutTimeLocal: checkOutUtc
              ? `${UTCMoment(checkOutUtc).format("MM/DD/YYYY hh:mm A")}`
              : "",
            location: {
              lat: attendeeType === "CHECK_IN" ? checkinLat : checkoutLat,
              lng: attendeeType === "CHECK_IN" ? checkinLng : checkoutLng,
            },
            status: status,
            shiftId: shiftId || "",
          };
        }),
      });

      if (currentView === "exceptions") {
        useMenuNumStore.getState().setIsRefreshShiftTimeAndAttendance(true);
      }
    } finally {
      setListDataInfo({
        loading: false,
      });
    }
  };

  useEffect(() => {
    setPagination({ pageNum: 1 });
    if (currentView === "exceptions") {
      setCurrentColum(columns_edit);
    } else if (currentView === "history") {
      setCurrentColum(columns_view);
    }
    setSearchParams({
      roleId: "",
      userId: "",
      status: "",
    });
  }, [currentView]);

  useEffect(() => {
    setListDataInfo({
      data: [],
    });
    getDataListFn();
  }, [
    searchParams,
    pagination.pageNum,
    pagination.pageSize,
    communityId,
    departmentIds,
    department,
  ]);

  useEffect(() => {
    if (pagination.pageNum === 1) {
      setListDataInfo({
        data: [],
      });
      getDataListFn();
    } else {
      setPagination({ pageNum: 1 });
    }
  }, [searchParams]);

  const refreshAfterEdit = () => {
    setReviewInfo({
      visible: false,
    });
    getDataListFn();
  };
  return (
    <PageContainer
      contentClassName={cn(ReviewInfo.visible && "p-0")}
      className={"min-w-[1400px] relative"}
    >
      {!ReviewInfo.visible && (
        <>
          <PageTitle title="Time and Attendance" isClose={false} />
          <Tabs
            className="mt-[30px]"
            items={tabsOptions}
            defaultActiveKey={currentView}
            onclick={setCurrentView}
          />
          <div className="mt-[20px]">
            <TableSearchForm
              isHistory={currentView === "history"}
              type={currentView}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            ></TableSearchForm>
          </div>
          <CustomTable
            adaptive
            headClass="z-1"
            columns={currentColum}
            data={listDataInfo.data}
            loading={listDataInfo.loading}
            ref={tableRef}
            pagination={pagination}
            changePageNum={(pageNum) => {
              setPagination({ pageNum });
            }}
            changePageSize={(pageSize) => {
              const nowSize =
                pagination.pageSize * (pagination.pageNum - 1) + 1;

              const pageNum = Math.ceil(nowSize / pageSize);

              setPagination({ ...pagination, pageSize, pageNum: pageNum });
            }}
          />
        </>
      )}
      {ReviewInfo.visible && !ReviewInfo.isView && (
        <ReviewShift
          refresh={refreshAfterEdit}
          onClose={() => {
            setReviewInfo({
              visible: false,
            });
          }}
          onSuccessful={(type: string | null) => {
            toast.success(
              ReviewInfo.data?.status === "NO_SHOW"
                ? type === "save"
                  ? MESSAGE.edit
                  : MESSAGE.confirm
                : MESSAGE.approve,
              { position: "top-center" }
            );
            getDataListFn();
            setReviewInfo({
              visible: false,
            });
          }}
          shiftId={ReviewInfo?.data?.shiftId || ""}
          id={ReviewInfo?.data?.id || ""}
        ></ReviewShift>
      )}
      {ReviewInfo.visible && ReviewInfo.isView && (
        <ViewShift
          onClose={() => {
            setReviewInfo({
              visible: false,
            });
          }}
          shiftId={ReviewInfo?.data?.shiftId || ""}
          id={ReviewInfo?.data?.id || ""}
        ></ViewShift>
      )}
      <CheckLocationDia
        checkType={checkType}
        location={locationInfo}
        open={checkLocationOpen}
        onClose={() => setCheckLocationOpen(false)}
      ></CheckLocationDia>
    </PageContainer>
  );
}
