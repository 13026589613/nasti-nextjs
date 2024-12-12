"use client";
import { useSetState } from "ahooks";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import {
  deleteDepartment,
  enabledDepartment,
  getDepartment,
  getDetails,
} from "@/api/department";
import { OrderByType, PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import NotData from "@/components/custom/NotData";
import Spin from "@/components/custom/Spin";
import CustomTable, { RefProps } from "@/components/custom/Table";
import { MESSAGE } from "@/constant/message";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";

import CommunityButton from "../component/communityButton";
import CheckInfo from "./components/CheckInfo";
import CreateDia from "./components/CreateDia";
import TableSearchForm from "./components/TableSearchForm";
import useReturnTableColumn from "./hooks/tableColumn";
import { DepartmentVo, GetDepartmentParams, SearchParams } from "./types";

/**
 * @description Department List Manager Page
 * @returns
 */
interface DepartmentPageProps {
  communityId: string;
  setIndex: (index: number) => void;
  pageIndex: number;
  isHiddenBtn?: boolean;
  getListCallBack?: () => void;
}
export default function DepartmentPage(props: DepartmentPageProps) {
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
  const [deleteItem, setDeleteItem] = useState<DepartmentVo | null>(null); // Delete item
  const [editDialogOpen, setEditDialogOpen] = useState(false); // Edit dialog open
  const [checkOpen, setCheckOpen] = useState(false); // check dialog open
  const [editItem, setEditItem] = useState<DepartmentVo | null>(null); // Edit item
  const [data, setData] = useState<DepartmentVo[]>([]); // Data
  const [orderBy, setOrderBy] = useState<OrderByType>([]); // OrderBy
  const [loading, _setLoading] = useState(false);
  const [enabledDialogOpen, setEnabledDialogOpen] = useState(false); // check enabledDialogOpen dialog open
  const [listLength, setListLength] = useState(0); // List length

  // Pagination
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });
  // Search params
  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    name: "",
    isHppd: undefined,
    isReportPbjHour: undefined,
  });

  const [loadingData, setLoadingData] = useState(false);

  /**
   * @description API - Load ListData By Params
   * @param params
   */
  const getList = async (
    params?: SearchParams & {
      pageNum?: number;
      pageSize?: number;
    }
  ) => {
    setLoadingData(true);
    try {
      let orderByString = "";
      orderBy.forEach((item: { key: any; order: any }) => {
        orderByString = `${item.key} ${item.order}`;
      });
      const res = await getDepartment(
        params
          ? ({
              pageNum: pagination.pageNum,
              ...params,
              communityId: communityId,
              pageSize: pagination.pageSize,
              orderBy: orderByString,
            } as GetDepartmentParams)
          : ({
              ...searchParams,
              communityId: communityId,
              pageNum: pagination.pageNum,
              pageSize: pagination.pageSize,
              orderBy: orderByString,
            } as GetDepartmentParams)
      );
      if (res.code === 200) {
        setData(res.data.records);
        setPagination({
          total: res.data.total,
        });
        if (listLength === 0 && res.data.records.length != 0) {
          setListLength(res.data.records.length);
        }

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
    const res = await deleteDepartment(id);
    if (res.code === 200) {
      toast.success(MESSAGE.delete, { position: "top-center" });
      useAppStore.getState().setIsRefreshDepartment(true);
      getList();
    }
    setDeleteDialogOpen(false);
  };

  /**
   * @description Fn - Delete Dialog
   * @param params
   */
  const deleteItemHandler = (item: DepartmentVo) => {
    deleteItemFn(item.id);
  };

  /**
   * @description API - Enabled One Data
   * @param params
   */
  const enabledItemFn = async (item: DepartmentVo) => {
    const res = await enabledDepartment(item?.id);
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
  const enabledItemHandler = (item: DepartmentVo) => {
    enabledItemFn(item);
  };
  /**
   * @description department info
   * @param params
   */

  const getSingleInfo = async (data: DepartmentVo) => {
    try {
      const id = data && data.id;
      const res = await getDetails(id);
      if (res.code === 200) {
        const result: any = res.data;
        setEditItem({
          ...result,
          newIsHppd: result.isHppd ? "Yes" : "No",
          newIsReportPbjHour: result.isReportPbjHour ? "Yes" : "No",
          newIsTrackCensus: result.isTrackCensus ? "Yes" : "No",
        });
      }
    } finally {
    }
  };
  // Data config
  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    getList();
  }, [pagination.pageNum, pagination.pageSize, communityId]);
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
    setEnabledDialogOpen,
    getSingleInfo,
  });

  // List Page
  return (
    <div className="w-full h-full flex flex-col overflow-hidden ">
      <div className="w-full h-full flex flex-col flex-1 min-h-0">
        {/* Table Search */}

        <TableSearchForm
          listLength={listLength}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          resetSearch={() => {
            getList({
              name: "",
              isHppd: undefined,
              isReportPbjHour: undefined,
              isTrackCensus: undefined,
              pageNum: 1,
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
                pageNum: params.pageNum,
              });
            } else {
              getList(params);
            }
          }}
          add={() => {
            setEditDialogOpen(true);
          }}
        ></TableSearchForm>

        <div
          className={`${
            isHiddenBtn ? "pb-[60px]" : "pb-[140px]"
          } flex-1 min-h-0 h-full w-full`}
        >
          <Spin className="w-full h-full" loading={loadingData}>
            {listLength > 0 && (
              <CustomTable
                className="w-full h-full"
                tableClassName={
                  pathname === "/onboarding/community" ? "" : "table-fixed"
                }
                columns={columns}
                data={data}
                loading={loadingData}
                adaptive={false}
                height={
                  pathname === "/community/create"
                    ? "calc(100vh - 545px)"
                    : pathname === "/onboarding/community"
                    ? "calc(100vh - 495px)"
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
            {listLength <= 0 && !loadingData && (
              <NotData
                className={cn(
                  pathname === "/community/create"
                    ? "h-[calc(100vh-500px)]"
                    : "550px"
                )}
                icon="noDataDeptIcon"
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
            deleteItemHandler(deleteItem as DepartmentVo);
          }}
        >
          Are you sure you want to delete this item?
        </ConfirmDialog>

        {/* Enabled Confirm */}
        <ConfirmDialog
          title={`${editItem?.isEnabled ? "Disable" : "Enable"} Department`}
          open={enabledDialogOpen}
          onClose={() => {
            setEnabledDialogOpen(false);
          }}
          onOk={() => {
            enabledItemHandler(editItem as DepartmentVo);
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
          ></CheckInfo>
        )}
      </div>

      {isHiddenBtn ? null : (
        <CommunityButton
          pathIndex={3}
          onPrevious={() => {
            setIndex(pageIndex - 1);
          }}
          onClick={() => {
            if (data.length === 0) {
              toast.warning("Please add at least one department.", {
                position: "top-center",
              });
              return;
            }
            setIndex(pageIndex + 1);
          }}
          loading={loading}
          isDisabled={data.length === 0}
          errorMsg="Please add at least one department."
          type="submit"
          className={`absolute bottom-0 left-0 right-[20px] bg-white mt-0 h-[80px] flex items-center justify-end pr-[10px]`}
          isHiddenBtn={isHiddenBtn}
        />
      )}
    </div>
  );
}
