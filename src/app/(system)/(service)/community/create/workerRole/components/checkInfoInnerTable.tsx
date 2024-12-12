"use client";
import { useSetState } from "ahooks";
import { forwardRef, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { OrderByType, PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable from "@/components/custom/Table";

import useReturnTableColumn from "../hooks/checkInfoInnerColumn";
import { SearchParams } from "../types";

/**
 * @description Department List Manager Page
 * @returns
 */
interface CreateAdminInnerTableProps {
  hideAction: boolean;
  setToggleDailog: (value: boolean) => void;
  setEditItem: (value: unknown) => void;
  setDeleteSuccess?: (value: unknown) => void;
  setDepartmentInfoSetting?: () => void;
  communityId: string;
  tableData: Array<{
    code: string;
    name: string;
    hppdTargetHour: string;
    id: string;
  }>;
}
const CreateAdminInnerTable = (
  props: CreateAdminInnerTableProps,
  ref: React.Ref<unknown>
) => {
  const {
    tableData,
    setToggleDailog,
    setDepartmentInfoSetting,
    setEditItem,
    setDeleteSuccess,
  } = props;
  const [newTableList, setNewTableList] = useState(tableData);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Delete dialog open
  const [deleteItem, setDeleteItem] = useState<any | null>(null); // Delete item
  // const [editDialogOpen, setEditDialogOpen] = useState(false); // Edit dialog open
  const [_data, _setData] = useState<any[]>([]); // Data
  const [orderBy, setOrderBy] = useState<OrderByType>([]); // OrderBy
  const [_loading, _setLoading] = useState(false);
  // Pagination
  const [pagination, _setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });
  // Search params
  const [searchParams, _setSearchParams] = useSetState<SearchParams>({
    name: "",
    // isHppd: "",
    // isReportPbjHour: "",
  });

  /**
   * @description API - Load ListData By Params
   * @param params
   */
  const getList = async (params?: any) => {};

  function deleteTableRow(row: { id: string }) {
    setDeleteSuccess && setDeleteSuccess(row);
    toast.success("Deleted successfully", { position: "top-center" });
    setDeleteDialogOpen(false);
  }

  useEffect(() => {
    setNewTableList(tableData);
  }, [tableData]);

  // Table column
  const { columns } = useReturnTableColumn({
    orderBy,
    pagination,
    searchParams,
    setDeleteDialogOpen,
    setDeleteItem,
    setToggleDailog,
    setDepartmentInfoSetting,
    setEditItem,
    setOrderBy,
    getList,
  });

  return (
    <div className="h-full">
      <div className="h-full">
        <CustomTable
          columns={columns}
          data={newTableList}
          loading={false}
          ref={ref}
          manualPagination={true}
          height="240px"
        />
      </div>

      {/* Operate Confirm */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
        }}
        onOk={() => {
          deleteTableRow(deleteItem);
        }}
      >
        Are you sure you want to delete this item?
      </ConfirmDialog>
    </div>
  );
};
export default forwardRef(CreateAdminInnerTable);
