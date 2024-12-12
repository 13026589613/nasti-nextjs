"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { deleteLocation, enabledLocation, getLocation } from "@/api/location";
import { OrderByType, PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import NotData from "@/components/custom/NotData";
import Spin from "@/components/custom/Spin";
import CustomTable, { RefProps } from "@/components/custom/Table";
import { MESSAGE } from "@/constant/message";

import CommunityButton from "../component/communityButton";
import CheckInfo from "./components/CheckInfo";
import CreateDia from "./components/CreateDia";
import TableSearchForm from "./components/TableSearchForm";
import useReturnTableColumn from "./hooks/tableColumn";
import { GetLocationParams, LocationVo, SearchParams } from "./types";

/**
 * @description Location List Manager Page
 * @returns
 */
interface LocationPageProps {
  communityId: string;
  setIndex: (index: number) => void;
  pageIndex: number;
  isHiddenBtn?: boolean;
}
export default function LocationPage(props: LocationPageProps) {
  const { communityId, setIndex, pageIndex, isHiddenBtn = false } = props;
  const tableRef = useRef<RefProps>(); // Table ref
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Delete dialog open
  const [deleteItem, setDeleteItem] = useState<LocationVo | null>(null); // Delete item
  const [editDialogOpen, setEditDialogOpen] = useState(false); // Edit dialog open
  const [editItem, setEditItem] = useState<LocationVo | null>(null); // Edit item
  const [checkOpen, setCheckOpen] = useState(false); // check dialog open
  const [enabledDialogOpen, setEnabledDialogOpen] = useState(false); // check enabledDialogOpen dialog open
  const [listLength, setListLength] = useState(0); // List length
  const [data, setData] = useState<LocationVo[]>([]); // Data
  const [orderBy, setOrderBy] = useState<OrderByType>([]); // OrderBy
  // Pagination
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });
  // Search params
  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    name: "",
  });

  const [loading, setLoading] = useState(false); // Loading

  /**
   * @description API - Load ListData By Params
   * @param params
   */
  const getList = async (
    params?: GetLocationParams & {
      pageNum?: number;
    }
  ) => {
    try {
      setLoading(true);
      let orderByString = "";
      orderBy.forEach((item: any) => {
        orderByString = `${item.key} ${item.order}`;
      });

      params = params
        ? params
        : ({
            ...searchParams,
            communityId: communityId,
            pageNum: pagination.pageNum,
            pageSize: pagination.pageSize,
            orderBy: orderByString,
          } as GetLocationParams);

      params.communityId = communityId;
      const res = await getLocation(params);
      if (res.code === 200) {
        setData(res.data.records);

        if (listLength === 0 && res.data.records.length != 0) {
          setListLength(res.data.records.length);
        }

        setPagination({
          total: res.data.total,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description API - Delete One Data
   * @param params
   */
  const deleteItemFn = async (id: string) => {
    const res = await deleteLocation(id);
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
  const deleteItemHandler = (item: LocationVo) => {
    deleteItemFn(item.id);
  };

  /**
   * @description API - Enabled One Data
   * @param params
   */
  const enabledItemFn = async (item: LocationVo) => {
    const res = await enabledLocation(item?.id);
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
  const enabledItemHandler = (item: LocationVo) => {
    enabledItemFn(item);
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
            tableRef.current?.clearSelectedRows();
            let orderByString = "";
            orderBy.forEach((item: any) => {
              orderByString = `${item.key} ${item.order}`;
            });
            getList({
              name: "",
              communityId: communityId,
              pageNum: 1,
              pageSize: pagination.pageSize,
              orderBy: orderByString,
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
          className={`${isHiddenBtn ? "pb-[0px]" : "pb-[70px]"} flex-1 min-h-0`}
        >
          <Spin className="w-full h-full" loading={loading}>
            {/* Table List */}
            {listLength > 0 && (
              <CustomTable
                columns={columns}
                data={data}
                loading={false}
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
                adaptive
              />
            )}
            {listLength === 0 && !loading && (
              <NotData
                descriptionClassName="text-[16px] font-[390]"
                className="h-[400px]"
                icon="noDataLocationIcon"
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
            deleteItemHandler(deleteItem as LocationVo);
          }}
        >
          Are you sure you want to delete this item?
        </ConfirmDialog>

        {/* Enabled Confirm */}
        <ConfirmDialog
          title={`${editItem?.isEnabled ? "Disable" : "Enable"} Location`}
          open={enabledDialogOpen}
          onClose={() => {
            setEnabledDialogOpen(false);
          }}
          onOk={() => {
            enabledItemHandler(editItem as LocationVo);
          }}
        >
          {`Are you sure you want to ${
            editItem?.isEnabled ? "disable" : "enable"
          } this item?`}
        </ConfirmDialog>

        {/* Info Form */}
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
      </div>

      {isHiddenBtn ? null : (
        <CommunityButton
          isHiddenBtn
          pathIndex={4}
          onPrevious={() => {
            setIndex(pageIndex - 1);
          }}
          onClick={() => {
            if (data.length === 0) {
              toast.warning("Please add at least one location.", {
                position: "top-center",
              });
              return;
            }
            setIndex(pageIndex + 1);
          }}
          type="submit"
          className="absolute bottom-0 left-0 right-[20px] bg-white mt-0 h-[80px] flex items-center justify-end pr-[10px]"
        />
      )}
    </div>
  );
}
