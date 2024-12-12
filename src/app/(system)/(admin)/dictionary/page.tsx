"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { deleteTypeDictinary, getTypeDictinary } from "@/api/dictionary";
import { OrderByType, PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, { RefProps } from "@/components/custom/Table";
import PageContainer from "@/components/PageContainer";
import { MESSAGE } from "@/constant/message";

import CreateDia from "./components/CreateDia";
import TableSearchForm from "./components/TableSearchForm";
import useReturnTableColumn from "./hooks/tableColumn";
import { DictinaryVo, GetTypeDictinaryParams, SearchParams } from "./type";

export default function Dictionary() {
  const tableRef = useRef<RefProps>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<DictinaryVo | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<DictinaryVo | null>(null);
  const [data, setData] = useState<DictinaryVo[]>([]);
  const [orderBy, setOrderBy] = useState<OrderByType>([]);
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });
  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    description: "",
    code: "",
  });

  const getList = async (params?: GetTypeDictinaryParams) => {
    let _orderByString = "";
    orderBy.forEach((item) => {
      _orderByString = `${item.key} ${item.order}`;
    });
    const res = await getTypeDictinary(
      params
        ? params
        : ({
            ...searchParams,
            pageNum: pagination.pageNum,
            pageSize: pagination.pageSize,
            orderBy: orderBy,
          } as GetTypeDictinaryParams)
    );
    if (res.code === 200) {
      setData(res.data.records);
      setPagination({
        total: res.data.total,
      });
    }
  };

  const deleteItemFn = async (id: string) => {
    const res = await deleteTypeDictinary(id);
    if (res.code === 200) {
      toast.success(MESSAGE.delete, { position: "top-center" });
      getList();
    }
    setDeleteDialogOpen(false);
  };

  const deleteItemHandler = (item: DictinaryVo) => {
    deleteItemFn(item.id);
  };

  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    getList();
  }, [pagination.pageNum, pagination.pageSize]);
  const { columns } = useReturnTableColumn({
    orderBy,
    pagination,
    searchParams,
    setDeleteDialogOpen,
    setDeleteItem,
    setEditDialogOpen,
    setEditItem,
    setOrderBy,
    getList,
  });

  return (
    <PageContainer>
      <TableSearchForm
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        resetSearch={() => {
          tableRef.current?.clearSelectedRows();
          getList({
            description: "",
            code: "",
          });
        }}
        search={getList}
        add={() => {
          setEditDialogOpen(true);
        }}
      ></TableSearchForm>
      <div className="h-[calc(100%-200px)]">
        <CustomTable
          columns={columns}
          data={data}
          loading={false}
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
        ></CustomTable>
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
        }}
        onOk={() => {
          deleteItemHandler(deleteItem as DictinaryVo);
        }}
      >
        Are you sure you want to delete this item?
      </ConfirmDialog>
      <CreateDia
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        editItem={editItem}
        onClose={() => {
          setEditItem(null);
        }}
        getLsit={getList}
      ></CreateDia>
    </PageContainer>
  );
}
