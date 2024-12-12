"use client";
import { useSetState, useUpdateEffect } from "ahooks";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { deleteAnnouncement, pageList } from "@/api/announcements";
import { pageListResVO } from "@/api/announcements/type";
import { PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable from "@/components/custom/Table";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";
import useGlobalTime from "@/hooks/useGlobalTime";
import useHasPermission from "@/hooks/useHasPermission";

import AnnouncementDetail from "./components/announcementDetail";
import CreateDia from "./components/createDia";
import TableSearchForm, { SearchParams } from "./components/SearchForm";
import useReturnNotificationsColumn from "./components/tableColumn";
export default function Announcements() {
  const { isHasAnnouncementDeletePermission, isHasAnnouncementAddPermission } =
    useHasPermission();

  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    dateTime: null,
    content: "",
  });
  const { UTCMoment } = useGlobalTime();
  const [announcementInfo, setAnnouncementInfo] = useState<{
    open: boolean;
    id: string;
  }>({
    open: false,
    id: "",
  });
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [listDataInfo, setListDataInfo] = useSetState({
    data: [] as pageListResVO[],
    loading: false,
  });

  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 0,
  });
  const { communityId } = useGlobalCommunityId();
  const [currentId, setCurrentId] = useState<string>("");
  const clickDelete = (id: string) => {
    setCurrentId(id);
    setConfirmDia(true);
  };

  const clickView = (id: string) => {
    setAnnouncementInfo({
      open: true,
      id,
    });
  };

  const [confirmDia, setConfirmDia] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const { columns } = useReturnNotificationsColumn({
    isHasAnnouncementDeletePermission,
    clickDelete,
    clickView,
  });
  const { departmentIds } = useGlobalDepartment();

  const getList = async (nowDepartmentId?: string) => {
    setListDataInfo({
      loading: true,
    });

    try {
      const { data, code } = await pageList({
        communityId,
        departmentIds: nowDepartmentId
          ? nowDepartmentId
          : departmentIds.join(","),
        createTimeStartUtc:
          searchParams.dateTime && searchParams.dateTime[0]
            ? `${searchParams.dateTime[0]} 00:00:00`
            : null,
        createTimeEndUtc:
          searchParams.dateTime && searchParams.dateTime[1]
            ? `${searchParams.dateTime[1]} 23:59:59`
            : null,
        content: searchParams.content,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      });
      if (code !== 200) return;
      const { records, total } = data;
      setPagination({
        ...pagination,
        total,
      });
      setListDataInfo({
        data: records.map((item) => {
          const { createdAt, expirationDateTimeLocal } = item;
          return {
            ...item,
            departmentNames: item.departmentNames.replaceAll(",", ", "),
            expirationDateTimeLocal: UTCMoment(expirationDateTimeLocal).format(
              "MM/DD/YYYY"
            ),
            createdAt: UTCMoment(createdAt).format("MM/DD/YYYY"),
          };
        }),
      });
    } finally {
      setListDataInfo({
        loading: false,
      });
    }
  };
  // const { run } = useDebounceFn(getList, { wait: 500 });

  const deleteRecord = async () => {
    try {
      setBtnLoading(true);
      const { code } = await deleteAnnouncement(currentId);
      if (code !== 200)
        return toast.error(MESSAGE.deleteError, { position: "top-center" });
      toast.success(MESSAGE.delete, { position: "top-center" });
      getList();
      setConfirmDia(false);
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    if (pagination.pageNum === 1) {
      getList();
    } else {
      setPagination({
        ...pagination,
        pageNum: 1,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    getList();
  }, [searchParams.dateTime, pagination.pageNum, pagination.pageSize]);

  useUpdateEffect(() => {
    if (departmentIds) {
      getList(departmentIds.join(","));
    }
  }, [departmentIds]);

  useUpdateEffect(() => {
    getList();
  }, [communityId]);

  return (
    <PageContainer className={"min-w-[1200px]"}>
      <PageTitle title="Announcements" isClose={false} />
      <div className="mt-[20px]">
        <TableSearchForm
          isHasAnnouncementAddPermission={isHasAnnouncementAddPermission}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          setEditDialogOpen={setEditDialogOpen}
        ></TableSearchForm>
      </div>
      <CustomTable
        adaptive
        columns={columns || []}
        data={listDataInfo.data}
        loading={listDataInfo.loading}
        pagination={pagination}
        changePageNum={(pageNum) => {
          setPagination({ ...pagination, pageNum });
        }}
        changePageSize={(pageSize) => {
          const nowSize = pagination.pageSize * (pagination.pageNum - 1) + 1;

          const pageNum = Math.ceil(nowSize / pageSize);

          setPagination({ ...pagination, pageSize, pageNum: pageNum });
        }}
      ></CustomTable>
      <CreateDia
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        editItem={editItem}
        onClose={() => {
          setEditItem(null);
        }}
        getList={getList}
      ></CreateDia>
      <ConfirmDialog
        btnLoading={btnLoading}
        open={confirmDia}
        onClose={() => {
          setConfirmDia(false);
        }}
        onOk={() => {
          deleteRecord();
        }}
      >
        Are you sure you want to delete the announcement?
      </ConfirmDialog>
      {announcementInfo.open && (
        <AnnouncementDetail
          announcementInfo={announcementInfo}
          onClose={() => {
            setAnnouncementInfo({
              open: false,
              id: "",
            });
          }}
        ></AnnouncementDetail>
      )}
    </PageContainer>
  );
}
