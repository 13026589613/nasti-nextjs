"use client";
import { useSetState, useUpdateEffect } from "ahooks";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { notificationsList, readNotification } from "@/api/notifications";
import CustomButton from "@/components/custom/Button";
// import Button from "@/components/custom/Button";
import CustomTable from "@/components/custom/Table";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalTime from "@/hooks/useGlobalTime";
import useNotification from "@/hooks/useNotification";
import useUserStore from "@/store/useUserStore";

import TableSearchForm, { SearchParams } from "./components/SearchForm";
import useReturnNotificationsColumn from "./components/tableColumn";
import { notificationsListItemVO } from "./type";
export default function Notifications() {
  const { communityId } = useGlobalCommunityId();
  const { UTCMoment, zoneAbbr } = useGlobalTime();

  const {
    isRefreshNotificationList,
    unreadNum,
    setUnreadNum,
    setIsRefreshNotificationList,
    setIsRefreshUnreadMessageNumber,
  } = useNotification();

  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    dateTime: null,
    notificationType: null,
  });

  const { userInfo } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const [listDataInfo, setListDataInfo] = useSetState({
    data: [] as notificationsListItemVO[],
    loading: false,
  });
  const [disPrev, setDisPrev] = useState<boolean>(true);
  const [disNext, setDisNext] = useState<boolean>(false);
  const [currPageNum, setCurrPageNum] = useState<number>(1);
  const [pageData, setPageData] = useState<{
    count: number;
    pageSize: number;
  }>({
    count: 0,
    pageSize: 10,
  });

  const setNotificationRead = async (ids: string[]) => {
    try {
      const { code } = await readNotification(ids);
      if (code !== 200) return;
      setUnreadNum(unreadNum - ids.length);
    } catch (error) {}
  };

  const clickIcon = async (notificationId: string) => {
    await setNotificationRead([notificationId]);
    setIsRefreshUnreadMessageNumber(true);
  };

  const { columns } = useReturnNotificationsColumn({ clickIcon });
  const [pageTokenList, setPageTokenList] = useState<string[]>([""]);
  const [isCanRequest, setIsCanRequest] = useState<boolean>(true);
  const [listLoading, setListLoading] = useSetState({
    nextLoading: false,
    preloading: false,
    loading: false,
  });

  const getDataList = async (isNeedReset?: boolean) => {
    setListLoading({
      loading: true,
    });
    try {
      setListDataInfo({
        loading: true,
      });
      const notificationType = searchParams.notificationType;
      const notifyStartDate =
        searchParams.dateTime && searchParams.dateTime[0]
          ? searchParams.dateTime[0]
          : null;
      const notifyEndDate =
        searchParams.dateTime && searchParams.dateTime[1]
          ? searchParams.dateTime[1]
          : null;
      const params = {
        userId: userInfo.id || "",
        communityId,
        notificationType,
        notifyStartDate,
        notifyEndDate,
        pageSize: pageData.pageSize,
        paginationToken: isNeedReset ? "" : pageTokenList[currPageNum - 1],
      };

      const { data, code } = await notificationsList(params);
      if (code !== 200 || !data) return;
      const { items, paginationToken, count, pageSize } = data;
      if (paginationToken && !pageTokenList.includes(paginationToken)) {
        const newPageTokenList = [...pageTokenList];
        newPageTokenList[currPageNum] = paginationToken;
        setPageTokenList(newPageTokenList);
      }
      setPageData({
        count,
        pageSize,
      });
      const list = items.map((item) => {
        let data = {
          ...item,
          createdAtUtc: item.createdAtUtc
            ? `${UTCMoment(item.createdAtUtc).format(
                "MM/DD/YYYY hh:mm A"
              )} (${zoneAbbr})`
            : "",
        };
        let metadata = "";
        try {
          metadata = data.metadata;
        } catch (error) {
          metadata = "";
        } finally {
          data.metadata = metadata;
          return data;
        }
      }) as notificationsListItemVO[];
      setListDataInfo({
        data: list,
      });
    } finally {
      setListDataInfo({
        loading: false,
      });
      setIsCanRequest(true);
      setListLoading({
        loading: false,
        nextLoading: false,
        preloading: false,
      });
    }
  };

  const updateBtnStatus = () => {
    const { count, pageSize } = pageData;
    setDisNext(
      count < pageSize ||
        !listDataInfo.data.length ||
        currPageNum >= pageTokenList.length
    );
    setDisPrev(currPageNum - 1 <= 0);
  };

  const handleClick = (num: number) => {
    setCurrPageNum(currPageNum + num);
  };

  useEffect(() => {
    updateBtnStatus();
  }, [pageData, listDataInfo.data, currPageNum, pageTokenList]);

  const reset = () => {
    setCurrPageNum(1);
    setPageTokenList([""]);
    setPageData({
      count: 0,
      pageSize: 10,
    });
  };

  useEffect(() => {
    if (isCanRequest) {
      setListDataInfo({
        data: [],
      });
      getDataList();
    }
  }, [currPageNum]);

  useEffect(() => {
    const { dateTime, notificationType } = searchParams;
    reset();
    if (dateTime || notificationType) {
      setIsCanRequest(false);
      getDataList(true);
    } else {
      getDataList(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isRefreshNotificationList && disPrev) {
      getDataList(true);
      setIsRefreshNotificationList(false);
    }
  }, [isRefreshNotificationList, disPrev]);

  const customPagination = () => {
    return (
      <div className="flex items-center justify-end mt-[15px]">
        <CustomButton
          loading={listLoading.preloading}
          className="h-8"
          disabled={disPrev || listLoading.nextLoading}
          variant="outline"
          onClick={() => {
            setListLoading({
              preloading: true,
            });
            handleClick(-1);
          }}
        >
          Prev
        </CustomButton>
        <CustomButton
          loading={listLoading.nextLoading}
          className="h-8 ml-4"
          disabled={disNext || listLoading.preloading}
          onClick={() => {
            setListLoading({
              nextLoading: true,
            });
            handleClick(1);
          }}
        >
          Next
        </CustomButton>
      </div>
    );
  };

  useUpdateEffect(() => {
    reset();
    getDataList(true);
  }, [communityId]);

  return (
    <PageContainer>
      <PageTitle title="Notifications" isClose={false} />
      <div className="mt-[20px]">
        <TableSearchForm
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        ></TableSearchForm>
      </div>
      <CustomTable
        adaptive
        columns={columns || []}
        data={listDataInfo.data}
        loading={listDataInfo.loading}
        customPagination={customPagination}
      ></CustomTable>
    </PageContainer>
  );
}
