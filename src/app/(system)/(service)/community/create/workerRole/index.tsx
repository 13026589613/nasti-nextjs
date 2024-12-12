"use client";
import { useSetState } from "ahooks";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { OrderByType, PaginationType } from "@/api/types";
import {
  deleteWorkerRole,
  enabledRoles,
  getDetails,
  getWorkerRole,
} from "@/api/workerRole";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import NotData from "@/components/custom/NotData";
import Spin from "@/components/custom/Spin";
import CustomTable, { RefProps } from "@/components/custom/Table";
import { MESSAGE } from "@/constant/message";
import { cn } from "@/lib/utils";

import CommunityButton from "../component/communityButton";
import CheckInfo from "./components/CheckInfo";
import CreateDia from "./components/CreateDia";
import TableSearchForm from "./components/TableSearchForm";
import useReturnTableColumn from "./hooks/tableColumn";
import { GetWorkerRoleParams, SearchParams, WorkerRoleVo } from "./types";

/**
 * @description WorkerRole List Manager Page
 * @returns
 */
interface RolesProps {
  communityId: string;
  setIndex: (index: number) => void;
  pageIndex: number;
  isHiddenBtn?: boolean;
  getListCallBack?: () => void;
}

export default function WorkerRolePage(props: RolesProps) {
  const {
    communityId,
    setIndex,
    pageIndex,
    isHiddenBtn = false,
    getListCallBack,
  } = props;
  const pathname = usePathname();
  const tableRef = useRef<RefProps>(); // Table ref
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Delete dialog open
  const [deleteItem, setDeleteItem] = useState<WorkerRoleVo | null>(null); // Delete item
  const [editDialogOpen, setEditDialogOpen] = useState(false); // Edit dialog open
  const [editItem, setEditItem] = useState<WorkerRoleVo | null>(null); // Edit item
  const [data, setData] = useState<WorkerRoleVo[]>([]); // Data
  const [orderBy, setOrderBy] = useState<OrderByType>([]); // OrderBy
  const [listLength, setListLength] = useState(0); // List length
  const [enabledDialogOpen, setEnabledDialogOpen] = useState(false); // check enabledDialogOpen dialog open

  // Pagination
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });
  // Search params
  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    code: "",
    name: "",
  });

  const [loading, _setLoading] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false); // check dialog open

  const [loadingData, setLoadingData] = useState(false); // Loading

  /**
   * @description API - Load ListData By Params
   * @param params
   */
  const getList = async (params?: GetWorkerRoleParams) => {
    try {
      setLoadingData(true);
      const res = await getWorkerRole(
        params
          ? { ...params, communityId: communityId }
          : ({
              ...searchParams,
              communityId: communityId,
              pageNum: pagination.pageNum,
              pageSize: pagination.pageSize,
              orderBy: orderBy,
            } as GetWorkerRoleParams)
      );
      if (res.code === 200) {
        setData(res.data.records);
        if (listLength === 0 && res.data.records.length != 0) {
          setListLength(res.data.records.length);
        }
        setPagination({
          total: res.data.total,
        });
        if (res.data.records.length > 0) {
          getListCallBack && getListCallBack();
        }
      }
    } finally {
      setLoadingData(false);
    }
  };

  /**
   * @description API - Delete One Data
   * @param params
   */
  const deleteItemFn = async (id: string) => {
    const res = await deleteWorkerRole(id);
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
  const deleteItemHandler = (item: WorkerRoleVo) => {
    deleteItemFn(item.id);
  };

  /**
   * @description API - Enabled One Data
   * @param params
   */
  const enabledItemFn = async (item: WorkerRoleVo) => {
    const res = await enabledRoles(item?.id);
    if (res.code === 200) {
      toast.success(item?.isEnabled ? MESSAGE.disabled : MESSAGE.enabled, {
        position: "top-center",
      });
      getList();
    }
    setEnabledDialogOpen(false);
  };

  /**
   * @description Fn - Enabled Dialog
   * @param params
   */
  const enabledItemHandler = (item: WorkerRoleVo) => {
    enabledItemFn(item);
  };

  // Data config
  useEffect(() => {
    getList();
  }, []);
  useEffect(() => {
    getList();
  }, [pagination.pageNum, pagination.pageSize, communityId]);
  const getSingleInfo = async (data: WorkerRoleVo) => {
    try {
      const id = data && data.id;
      const res = await getDetails(id);
      if (res.code === 200) {
        const result: any = res.data;
        setEditItem(result);
      }
    } finally {
    }
  };
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
    setCheckOpen,
    checkOpen,
    setEnabledDialogOpen,
    getSingleInfo,
  });

  // List Page
  return (
    <div className="w-full h-full flex flex-col overflow-hidden pb-[60px]">
      <div className="w-full h-full flex flex-col flex-1 min-h-0">
        {/* Table Search */}
        <TableSearchForm
          listLength={listLength}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          resetSearch={() => {
            getList({
              code: "",
              name: "",
              communityId: communityId,
              pageNum: 1,
              pageSize: 15,
            });
            setPagination({
              pageNum: 1,
            });
          }}
          search={(params) => {
            if (
              params?.pageNum !== null &&
              params?.pageNum !== undefined &&
              params?.pageNum != pagination.pageNum
            ) {
              setPagination({
                pageNum: 1,
              });
            } else {
              getList(params);
            }
          }}
          add={() => {
            setEditItem(null);
            setEditDialogOpen(true);
          }}
        ></TableSearchForm>

        <div
          className={`${
            isHiddenBtn ? "pb-[0px]" : "pb-[70px]"
          } flex-1 min-h-0 h-full`}
        >
          {/* Table List */}
          <Spin className="w-full h-full" loading={loadingData}>
            {listLength > 0 && (
              <CustomTable
                className="h-full"
                columns={columns}
                tableClassName={
                  pathname === "/onboarding/community" ? "" : "table-fixed"
                }
                data={data}
                loading={false}
                height={
                  pathname === "/community/create"
                    ? "calc(100vh - 550px)"
                    : pathname === "/onboarding/community"
                    ? "calc(100vh - 508px)"
                    : "100%"
                }
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
            )}
            {listLength === 0 && !loadingData && (
              <NotData
                className={cn(
                  pathname === "/community/create"
                    ? "h-[calc(100vh-510px)]"
                    : pathname === "/onboarding/community"
                    ? "h-[calc(100vh-540px)]"
                    : "-h-[550px]"
                )}
                icon="RolesIcon"
              />
            )}
          </Spin>
        </div>

        {/* Operate Confirm */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
          }}
          onOk={() => {
            deleteItemHandler(deleteItem as WorkerRoleVo);
          }}
        >
          Are you sure you want to delete this item?
        </ConfirmDialog>

        {/* Enabled Confirm */}
        <ConfirmDialog
          title={`${editItem?.isEnabled ? "Disable" : "Enable"} Role`}
          open={enabledDialogOpen}
          onClose={() => {
            setEnabledDialogOpen(false);
          }}
          onOk={() => {
            enabledItemHandler(editItem as WorkerRoleVo);
          }}
        >
          {`Are you sure you want to ${
            editItem?.isEnabled ? "disable" : "enable"
          } this item?`}
        </ConfirmDialog>

        {/* Info Form */}
        {editDialogOpen && (
          <CreateDia
            open={editDialogOpen}
            setOpen={setEditDialogOpen}
            editItem={editItem}
            onClose={() => {
              setEditItem(null);
            }}
            communityId={communityId}
            getLsit={getList}
            editInnerItem={null}
          ></CreateDia>
        )}

        {/* look at Form infor */}
        {checkOpen && (
          <CheckInfo
            open={checkOpen}
            setOpen={setCheckOpen}
            editItem={editItem}
            onClose={() => {
              setEditItem(null);
            }}
            communityId={communityId}
            getLsit={getList}
            editInnerItem={null}
          ></CheckInfo>
        )}
      </div>

      {isHiddenBtn ? null : (
        <CommunityButton
          pathIndex={5}
          isHiddenBtn={isHiddenBtn}
          onPrevious={() => {
            setIndex(pageIndex - 1);
          }}
          onClick={() => {
            if (data.length === 0) {
              toast.warning("Please add at least one role.", {
                position: "top-center",
              });
              return;
            }
            setIndex(pageIndex + 1);
          }}
          loading={loading}
          type="submit"
          className="absolute bottom-0 left-0 right-[20px] bg-white mt-0 h-[80px] flex items-center justify-end pr-[10px]"
        />
      )}
    </div>
  );
}
