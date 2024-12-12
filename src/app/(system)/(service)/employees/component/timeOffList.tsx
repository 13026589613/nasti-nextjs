"use client";
import { useSetState } from "ahooks";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { createChannel } from "@/api/chat";
import {
  employeeTimeOffInfo,
  // getEmployeeListPage,
  getWorkDetails,
  shiftList,
  timeOffList,
} from "@/api/employees";
import { EmployeesTableList, OrderByType, PaginationType } from "@/api/types";
import CustomButton from "@/components/custom/Button";
import CustomTable, { RefProps } from "@/components/custom/Table";
import Tabs from "@/components/custom/Tabs";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalTime from "@/hooks/useGlobalTime";
import useDepartmentStore from "@/store/useDepartmentStore";
import useUserStore from "@/store/useUserStore";
import XCloseIcon from "~/icons/XCloseIcon.svg";

import { ChannelListResponse } from "../../messages/type";
import ChatDia from "../../shiftsNeedHelp/components/ChatDia";
import CreateDia from "../component/CreateDia";
import TimeSearchForm from "../component/TimeSearchForm";
import useReturnTableColumn from "../hooks/tableTimeShiftColumn";
import { timeOffInfoResponseVo } from "../type";
import { shiftListResponseVo } from "../type";
import {
  EmployeesVo,
  GetTypeEmployeeParams,
  SearchParams,
  timeOffListResponseVo,
} from "../type";
import EditInfo from "./editInfo";
import TimeOffCheckDia from "./TimeOffCheckDia";
interface TimeOffListProps {
  setIsChild: (arg: boolean) => void;
  refreshList: () => void;
  editData: EmployeesVo | null;
  isView: boolean | undefined;
  isFocus: boolean;
}

export default function TimeOffList(props: TimeOffListProps) {
  const { refreshList, setIsChild, editData, isView, isFocus } = props;

  const communityInfo = useGlobalCommunityId();

  const { UTCMoment, zoneAbbr } = useGlobalTime();

  const pathname = usePathname();
  const { getDepartmentIds } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const { userInfo } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const tableRef = useRef<RefProps>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<EmployeesVo | null>(null);
  const [orderBy, setOrderBy] = useState<OrderByType>([]);
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });

  const [employeesTableList, setEmployeesTableList] =
    useState<EmployeesTableList>([]);
  const { id }: any = useUserStore.getState()?.operateCommunity;
  const [communityId, setCommunityId] = useState("");
  const [departmentld, setDepartmentld] = useState("");
  const [status] = useState<Array<string>>([]);
  const [openTimeOffDia, setOpenTimeOffDia] = useState<boolean>(false);
  const [timeOffDiaType, setTimeOffDiaType] = useState<string>("");

  const [startDate, setStartDate] = useState<string[] | null>(null);
  const [endDate, setEndDate] = useState<string[] | null>(null);
  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    communityId: id,
    departmentIds: departmentld,
    keywords: "",
    roleId: "",
    exceptions: null,
    license: "",
    status: status,
  });
  const [isAdd, setIsAdd] = useState(true);
  const [timeOffInfo, setTimeOffInfo] = useState<timeOffInfoResponseVo>();
  const [chatModalOpen, setChatModalOpen] = useState(false);

  const [channelData, setChannelData] = useState<ChannelListResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const isMe = useMemo(
    () => editItem?.userId === userInfo?.id,
    [editItem?.userId, userInfo.id]
  );

  const getList = async (params?: GetTypeEmployeeParams) => {
    const departmentIds = getDepartmentIds(pathname);
    try {
      if (["CurrentShifts", "PastShifts"].includes(defaultActiveKey)) {
        const handleShiftData = (
          list: shiftListResponseVo[]
        ): EmployeesTableList => {
          const tableList = list.map((obj) => {
            return {
              id: obj.id || "",
              shiftDate: obj.startTimeUTC
                ? `${UTCMoment(obj.startTimeUTC).format(
                    "MM/DD/YYYY"
                  )} (${zoneAbbr})`
                : "",
              shiftTime:
                obj.startTimeUTC && obj.endTimeUTC
                  ? `${UTCMoment(obj.startTimeUTC).format(
                      "hh:mm A"
                    )} - ${UTCMoment(obj.endTimeUTC).format(
                      "hh:mm A"
                    )} (${zoneAbbr})`
                  : "",
              role: obj.workerRoleName || "",
              checkInTime: obj.checkinTime || "",
              checkOutTime: obj.checkoutTime || "",
              exceptions: obj.exceptions,
            };
          });
          return tableList;
        };
        const { data, code } = await shiftList({
          shiftStartDate: startDate
            ? startDate[0]
              ? startDate[0]
              : null
            : null,
          shiftEndDate: startDate ? (startDate[1] ? startDate[1] : null) : null,
          communityId,
          type: defaultActiveKey === "CurrentShifts" ? "current" : "past",
          workerRoleId: searchParams.roleId || null,
          userId: editItem?.userId || "",
          pageNum: pagination.pageNum,
          pageSize: pagination.pageSize,
          exceptionTypeEnum: searchParams.exceptions || undefined,
        });
        if (code === 200) {
          const { records, total } = data;
          setPagination({
            total,
          });
          setEmployeesTableList(handleShiftData(records));
        }
      } else if (
        ["timeOffRequests", "timeOffHistory"].includes(defaultActiveKey)
      ) {
        const handleTimeoffList = (
          list: timeOffListResponseVo[]
        ): EmployeesTableList => {
          return list.map((obj) => {
            return {
              id: obj.id || "",
              startDateTime: obj.startTimeUtc
                ? `${UTCMoment(obj.startTimeUtc).format(
                    "MM/DD/YYYY hh:mm A"
                  )} (${zoneAbbr})`
                : "",
              endDateTime: obj.endTimeUtc
                ? `${UTCMoment(obj.endTimeUtc).format(
                    "MM/DD/YYYY hh:mm A"
                  )} (${zoneAbbr})`
                : "",
              reason: obj.reason || "",
              status: obj.status || "",
              arb: obj.userName || "",
              arbdt: obj.reviewTime
                ? `${UTCMoment(obj.reviewTime).format(
                    "MM/DD/YYYY hh:mm A"
                  )} (${zoneAbbr})`
                : "",
            };
          });
        };
        const status = (
          defaultActiveKey === "timeOffHistory"
            ? searchParams.status?.length
              ? searchParams.status
              : ["APPROVED", "REJECTED"]
            : ["PENDING"]
        ) as string[];
        const { data, code } = await timeOffList({
          departmentIds,
          startFromDate: startDate
            ? startDate[0]
              ? startDate[0]
              : null
            : null,
          startToDate: startDate ? (startDate[1] ? startDate[1] : null) : null,
          endFromDate: endDate ? (endDate[0] ? endDate[0] : null) : null,
          endToDate: endDate ? (endDate[1] ? endDate[1] : null) : null,
          communityId,
          status,
          userId: editItem?.userId || "",
        });
        if (code === 200) {
          const { records, total } = data;
          setPagination({
            total,
          });
          setEmployeesTableList(handleTimeoffList(records));
        }
      }
      // let orderByString = "";
      // orderBy.forEach((item) => {
      //   orderByString = `${item.key} ${item.order}`;
      // });
      // const res = await getEmployeeListPage(
      //   params
      //     ? params
      //     : ({
      //         ...searchParams,
      //         pageNum: pagination.pageNum,
      //         pageSize: pagination.pageSize,
      //         orderBy: orderByString,
      //       } as GetTypeEmployeeParams)
      // );

      // if (res.code === 200 && res.data) {
      //   const { total } = res.data || {};
      //   // setData(records);
      //   setPagination({
      //     total: total,
      //   });
      // }
    } catch (error) {}
  };
  useEffect(() => {
    if (editData) {
      setEditItem(editData);
    }
  }, [editData]);

  useEffect(() => {
    const { id, name }: any = useUserStore.getState()?.operateCommunity;
    if (name) {
      setDepartmentld(name);
    }
    if (id) {
      setCommunityId(id);
    }
  }, []);

  function handleCallDetails(row: any) {
    getListDetails(row);
  }
  const handleAction = async (id: string, type: "view" | "edit") => {
    try {
      setTimeOffDiaType(type === "view" ? "view" : "review");
      const { data, code } = await employeeTimeOffInfo(id);
      if (code === 200) {
        setTimeOffInfo(data);
        setOpenTimeOffDia(true);
      }
    } catch (error) {}
  };
  const [defaultActiveKey, setDefaultActiveKey] = useState("employeeInfo");
  const [isEmployeeInfo, setIsEmployeeInfo] = useState(true);

  const { columns } = useReturnTableColumn({
    orderBy,
    pagination,
    searchParams,
    setEditDialogOpen,
    setEditItem,
    setOrderBy,
    getList,
    setIsAdd,
    handleCallDetails,
    setIsChild,
    defaultActiveKey,
    handleAction,
  });

  useEffect(() => {
    getList();
  }, [
    pagination.pageNum,
    pagination.pageSize,
    status,
    defaultActiveKey,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    if (pagination.pageNum === 1) {
      getList();
    } else {
      setPagination({
        pageNum: 1,
      });
    }
  }, [searchParams]);

  const btnList = [
    {
      label: "Employee Info",
      key: "employeeInfo",
    },
    {
      label: "Current Shifts",
      key: "CurrentShifts",
    },
    {
      label: "Past Shifts",
      key: "PastShifts",
    },
    {
      label: "Time Off Requests",
      key: "timeOffRequests",
    },
    {
      label: "Request History",
      key: "timeOffHistory",
    },
  ];

  function handleFileChange(file: File) {}
  const getListDetails = async (data: any) => {
    try {
      const res = await getWorkDetails(data.userId, communityId);
      if (res.code === 200) {
        const result: any = res.data;
        setEditItem(result);
      }
    } finally {
    }
  };
  function handleTab(value: string) {
    setDefaultActiveKey(value);
    setStartDate(null);
    setEndDate(null);
    setPagination({
      pageNum: 1,
    });
    setSearchParams({
      ...searchParams,
      roleId: "",
    });
    if (value == "employeeInfo") {
      setIsEmployeeInfo(true);
    } else {
      setIsEmployeeInfo(false);
    }
  }
  function handleCloseChild() {
    setIsChild(false);
    refreshList();
  }

  const handleChatModalOpen = async () => {
    try {
      setLoading(true);
      const res = await createChannel({
        userIds: [editData?.userId || ""],
        communityId: communityInfo.communityId,
      });
      if (res.code === 200) {
        setChannelData(res.data[0]);
        setChatModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="flex justify-between items-center">
        <span className="font-[450] text-[24px] text-[#324664]">
          Employee Detail -{" "}
          {`${editItem && editItem.firstName} ${editItem && editItem.lastName}`}
          {!isMe && (
            <CustomButton
              loading={loading}
              className="ml-9"
              colorStyle="green97"
              icon="messageIcon"
              onClick={handleChatModalOpen}
            >
              Message
            </CustomButton>
          )}
        </span>
        <XCloseIcon className="cursor-pointer" onClick={handleCloseChild} />
      </div>
      <div className="my-[30px]">
        <Tabs
          items={btnList}
          defaultActiveKey={defaultActiveKey}
          onclick={handleTab}
        />
      </div>
      {isEmployeeInfo ? (
        <EditInfo
          isFocus={isFocus}
          isAdd={false}
          open={true}
          isView={isView}
          editItem={editItem}
          departmentData={editItem?.departments}
          communityId={communityId}
        />
      ) : (
        <>
          <TimeSearchForm
            communityId={communityId}
            searchParams={searchParams}
            startDate={startDate}
            endDate={endDate}
            setSearchParams={setSearchParams}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            defaultActiveKey={defaultActiveKey}
          ></TimeSearchForm>
          {/* upload input file */}
          <input
            className="hidden"
            id="imgFile"
            type="file"
            accept="*"
            onChange={(event: any) => {
              const file = event.target.files[0];
              handleFileChange(file);
            }}
          />
          {/* table */}
          <div className="h-[calc(100%-200px)]">
            <CustomTable
              columns={columns}
              data={employeesTableList}
              loading={false}
              adaptive
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
          </div>
          {/* add or edit */}
          {editDialogOpen && (
            <CreateDia
              isFocus={isFocus}
              open={editDialogOpen}
              setOpen={setEditDialogOpen}
              editItem={editItem}
              isAdd={isAdd}
              communityId={communityId}
              onClose={() => {
                setEditDialogOpen(false);
                setEditItem(null);
              }}
              getLsit={getList}
            ></CreateDia>
          )}

          {openTimeOffDia && (
            <TimeOffCheckDia
              open={openTimeOffDia}
              type={timeOffDiaType}
              data={timeOffInfo || null}
              onClose={() => {
                setOpenTimeOffDia(false);
              }}
              onSuccess={() => {
                getList();
                setOpenTimeOffDia(false);
              }}
            ></TimeOffCheckDia>
          )}
        </>
      )}
      {chatModalOpen && (
        <ChatDia
          currentChannel={channelData}
          onClose={() => {
            setChatModalOpen(false);
          }}
        ></ChatDia>
      )}
    </>
  );
}
