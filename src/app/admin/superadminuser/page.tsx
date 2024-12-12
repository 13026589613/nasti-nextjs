"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useImmer } from "use-immer";

import { deleteUser, getUserList, sentInitation } from "@/api/admin/user";
import { UserParams } from "@/api/admin/user/type";
import { SearchParams, UserVo } from "@/api/admin/user/type";
import { OrderByType, PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, { RefProps } from "@/components/custom/Table";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import { MESSAGE } from "@/constant/message";

import CreateDia from "./components/CreateDia";
import TableSearchForm from "./components/SearchForm";
import useReturnTableColumn, { UserIconType } from "./hooks/tableColumn";
const User = () => {
  const [loading, setLoading] = useImmer<{
    pageLoading: boolean;
    tableLoading: boolean;
  }>({
    pageLoading: false,
    tableLoading: false,
  });

  const tableRef = useRef<RefProps>();

  const [orderBy, setOrderBy] = useState<OrderByType>([]);

  const [optionDia, setOptionDia] = useImmer<{
    delete: boolean;
  }>({
    delete: false,
  });

  const [diaBtnLoading, setDiaBtnLoading] = useImmer<{
    deleteLoading: boolean;
  }>({
    deleteLoading: false,
  });

  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });

  const [data, setData] = useState<UserVo[]>([]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [editItem, setEditItem] = useState<UserVo | null>(null);

  const optionIconClick = (item: UserVo, type: UserIconType) => {
    setEditItem(item);
    if (type === "edit") {
      setEditDialogOpen(true);
    } else if (type === "delete") {
      setOptionDia((draft) => {
        draft.delete = true;
      });
    } else if (type === "sendInvitation") {
      Invite(item);
    }
  };

  const Invite = async (item: UserVo) => {
    try {
      const res = await sentInitation({
        userCommunityRefIds: [item.userCommunityRefId],
        redirectUrl: location.origin,
      });
      if (res.code === 200 && res.data) {
        toast.success(MESSAGE.invitationSent, {
          position: "top-center",
        });
      }
    } finally {
    }
  };

  const getUserListData = () => {
    getList();
  };

  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    condition: "",
  });

  const { columns } = useReturnTableColumn({
    orderBy,
    setOrderBy,
    optionIconClick,
    getUserListData,
  });

  const getList = async (params?: UserParams) => {
    setLoading((draft) => {
      draft.pageLoading = true;
      draft.tableLoading = true;
    });
    try {
      const res = await getUserList(
        params
          ? params
          : ({
              ...searchParams,
              pageNum: pagination.pageNum,
              pageSize: pagination.pageSize,
            } as UserParams)
      );
      if (res.code === 200) {
        setData(res.data.records);

        setPagination({
          total: res.data.total,
        });
      }
    } finally {
      setLoading((draft) => {
        draft.pageLoading = false;
        draft.tableLoading = false;
      });
    }
  };

  const handlePageSize = (pageSize: number) => {
    const nowSize = pagination.pageSize * (pagination.pageNum - 1) + 1;
    const pageNum = Math.ceil(nowSize / pageSize);
    setPagination({ ...pagination, pageSize, pageNum: pageNum });
  };

  const deleteItemHandler = (item: UserVo) => {
    deleteItemFn(item.id);
  };

  const deleteItemFn = async (ids: string) => {
    setDiaBtnLoading((draft) => {
      draft.deleteLoading = true;
    });

    try {
      const res = await deleteUser(ids);
      if (res.code === 200) {
        toast.success(MESSAGE.delete, {
          position: "top-center",
        });
        getList();
      }
    } finally {
      setDiaBtnLoading((draft) => {
        draft.deleteLoading = false;
      });
      setOptionDia((draft) => {
        draft.delete = false;
      });
    }
  };

  useEffect(() => {
    getList();
  }, [pagination.pageNum, pagination.pageSize]);

  useEffect(() => {
    if (pagination.pageNum === 1) {
      getList();
    } else {
      setPagination({ pageNum: 1 });
    }
  }, [searchParams]);

  return (
    <PageContainer className={"min-w-[1400px] relative"}>
      <>
        <PageTitle title="Super Admins" isClose={false} />

        <TableSearchForm
          loading={loading}
          setLoading={setLoading}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          add={() => {
            setEditDialogOpen(true);
          }}
        ></TableSearchForm>

        <CustomTable
          columns={columns}
          data={data}
          loading={loading.tableLoading}
          adaptive
          ref={tableRef}
          pagination={pagination}
          changePageNum={(pageNum) => setPagination({ pageNum })}
          changePageSize={(pageSize) => handlePageSize(pageSize)}
        />

        <CreateDia
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          editItem={editItem}
          onClose={() => {
            setEditItem(null);
          }}
          getLsit={getList}
        ></CreateDia>

        <ConfirmDialog
          btnLoading={diaBtnLoading.deleteLoading}
          open={optionDia.delete}
          onClose={() => {
            setOptionDia((draft) => {
              draft.delete = false;
            });
            setEditItem(null);
          }}
          onOk={() => {
            deleteItemHandler(editItem as UserVo);
            setEditItem(null);
          }}
        >
          Are you sure you want to delete this user?
        </ConfirmDialog>
      </>
    </PageContainer>
  );
};

export default User;
