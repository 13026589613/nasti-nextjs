"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { deletePbjJob, getPbjJob } from "@/api/pbjJob";
import { OrderByType, PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, { RefProps } from "@/components/custom/Table";
import PageContainer from "@/components/PageContainer";
import { MESSAGE } from "@/constant/message";

import CreateDia from "./components/CreateDia";
import TableSearchForm from "./components/TableSearchForm";
import useReturnTableColumn from "./hooks/tableColumn";
import { GetPbjJobParams, PbjJobVo, SearchParams } from "./types";

/**
 * @description PbjJob List Manager Page
 * @returns
 */
export default function PbjJobPage() {
  const tableRef = useRef<RefProps>(); // Table ref
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Delete dialog open
  const [deleteItem, setDeleteItem] = useState<PbjJobVo | null>(null); // Delete item
  const [editDialogOpen, setEditDialogOpen] = useState(false); // Edit dialog open
  const [editItem, setEditItem] = useState<PbjJobVo | null>(null); // Edit item
  const [data, setData] = useState<PbjJobVo[]>([]); // Data
  const [orderBy, setOrderBy] = useState<OrderByType>([]); // OrderBy
  // Pagination
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });
  // Search params
  const [searchParams, setSearchParams] = useSetState<SearchParams>({});

  /**
   * @description API - Load ListData By Params
   * @param params
   */
  const getList = async (params?: GetPbjJobParams) => {
    let _orderByString = "";
    orderBy.forEach((item: any) => {
      _orderByString = `${item.key} ${item.order}`;
    });
    const res = await getPbjJob(
      params
        ? params
        : ({
            ...searchParams,
            pageNum: pagination.pageNum,
            pageSize: pagination.pageSize,
            orderBy: orderBy,
          } as GetPbjJobParams)
    );
    if (res.code === 200) {
      setData(res.data.records);
      setPagination({
        total: res.data.total,
      });
    }
  };

  /**
   * @description API - Delete One Data
   * @param params
   */
  const deleteItemFn = async (id: string) => {
    const res = await deletePbjJob(id);
    if (res.code === 200) {
      toast.success(MESSAGE.delete, { position: "top-center" });
      getList();
    }
    setDeleteDialogOpen(false);
  };

  /**
   * @description Fn - Delete Dialog
   * @param params
   */
  const deleteItemHandler = (item: PbjJobVo) => {
    deleteItemFn(item.id);
  };

  // Data config
  useEffect(() => {
    getList();
  }, []);
  useEffect(() => {
    getList();
  }, [pagination.pageNum, pagination.pageSize]);

  // Table column
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

  // List Page
  return (
    <PageContainer>
      {/* Table Search */}
      <TableSearchForm
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        resetSearch={() => {
          getList({});
        }}
        search={getList}
        add={() => {
          setEditDialogOpen(true);
        }}
      ></TableSearchForm>

      <div className="h-[calc(100%-200px)]">
        {/* Table List */}
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
        />
      </div>

      {/* Operate Confirm */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
        }}
        onOk={() => {
          deleteItemHandler(deleteItem as PbjJobVo);
        }}
      >
        Are you sure you want to delete this item?
      </ConfirmDialog>

      {/* Info Form */}
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
