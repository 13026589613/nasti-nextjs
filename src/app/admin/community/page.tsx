"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useImmer } from "use-immer";

import {
  deleteCommunity,
  getCommunityList,
  updateCommunityState,
} from "@/api/admin/community";
import { CommunitySearchParams, CommunityVo } from "@/api/admin/community/type";
import { OrderByType, PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, { RefProps } from "@/components/custom/Table";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import { MESSAGE } from "@/constant/message";

import CreateDia from "../community/components/CreateDia";
import TableSearchForm from "./components/SearchForm";
import useReturnTableColumn, { CompanyIconType } from "./hooks/tableColumn";
const Community = () => {
  const [loading, setLoading] = useImmer<{
    pageLoading: boolean;
    tableLoading: boolean;
  }>({
    pageLoading: false,
    tableLoading: false,
  });

  const tableRef = useRef<RefProps>();

  const [orderBy, setOrderBy] = useState<OrderByType>([]);

  const optionIconClick = (item: CommunityVo, type: CompanyIconType) => {
    setOperateItem({ ...item, type });
    if (type === "edit") {
      setEditDialogOpen(true);
    } else if (type === "active") {
      setOptionDia((draft) => {
        draft.open = true;
        draft.content = MESSAGE.activateCommunity;
      });
    } else if (type === "deactivate") {
      setOptionDia((draft) => {
        draft.open = true;
        draft.content = MESSAGE.deactivateCommunity;
      });
    } else if (type === "delete") {
      setOptionDia((draft) => {
        draft.open = true;
        draft.content = MESSAGE.deleteCommunity;
      });
    }
  };

  const getCommunityListData = () => {
    getList();
  };

  const [searchParams, setSearchParams] = useSetState<CommunitySearchParams>(
    {}
  );

  const { columns } = useReturnTableColumn({
    orderBy,
    setOrderBy,
    optionIconClick,
    getCommunityListData,
  });

  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });

  const [data, setData] = useState<CommunityVo[]>([]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [operateItem, setOperateItem] = useState<CommunityVo | null>(null);

  const [optionDia, setOptionDia] = useImmer<{
    open: boolean;
    content: string;
  }>({
    open: false,
    content: "",
  });

  const [diaBtnLoading, setDiaBtnLoading] = useImmer<{
    deleteLoading: boolean;
  }>({
    deleteLoading: false,
  });

  const deleteItemHandler = (item: CommunityVo) => {
    if (item.type === "deactivate" || item.type === "active") {
      edit(item);
    } else if (item.type === "delete") {
      deleteItemFn(item?.id);
    }
  };

  const deleteItemFn = async (id: string) => {
    setDiaBtnLoading((draft) => {
      draft.deleteLoading = true;
    });
    try {
      const res = await deleteCommunity(id);
      if (res.code === 200 && res.data) {
        toast.success(MESSAGE.delete, { position: "top-center" });
        getList();
      }
    } finally {
      setDiaBtnLoading((draft) => {
        draft.deleteLoading = false;
      });
      setOptionDia((draft) => {
        draft.open = false;
      });
    }
  };

  const edit = async (item: CommunityVo) => {
    setDiaBtnLoading((draft) => {
      draft.deleteLoading = true;
    });
    try {
      const res = await updateCommunityState(item.id);
      if (res.code === 200 && res.data) {
        toast.success(
          item.type === "active"
            ? "Activated successfully."
            : "Deactivated successfully.",
          { position: "top-center" }
        );
        getList();
      }
    } finally {
      setOptionDia((draft) => {
        draft.open = false;
      });
      setDiaBtnLoading((draft) => {
        draft.deleteLoading = false;
      });
    }
  };

  const getList = async (params?: CommunitySearchParams) => {
    setLoading((draft) => {
      draft.pageLoading = true;
      draft.tableLoading = true;
    });
    try {
      const res = await getCommunityList(
        params
          ? params
          : ({
              ...searchParams,
              isEnabled: !searchParams.isEnabled
                ? null
                : searchParams.isEnabled === "ACTIVE"
                ? true
                : false,
              pageNum: pagination.pageNum,
              pageSize: pagination.pageSize,
            } as CommunitySearchParams)
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
        <PageTitle className="mb-6" title="Communities" isClose={false} />

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
          operateItem={operateItem}
          onClose={() => {
            setOperateItem(null);
          }}
          getLsit={getList}
        ></CreateDia>

        <ConfirmDialog
          btnLoading={diaBtnLoading.deleteLoading}
          open={optionDia.open}
          onClose={() => {
            setOptionDia((draft) => {
              draft.open = false;
            });
          }}
          onOk={() => {
            deleteItemHandler(operateItem as CommunityVo);
          }}
        >
          {optionDia.content}
        </ConfirmDialog>
      </>
    </PageContainer>
  );
};

export default Community;
