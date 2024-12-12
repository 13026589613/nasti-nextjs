"use client";
import { useSetState } from "ahooks";
import { forwardRef, useEffect, useState } from "react";

import { OrderByType, PaginationType } from "@/api/types";
import CustomTable from "@/components/custom/Table";

import useReturnTableColumn from "../hooks/createAdminInnerColumn";
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

  function handleDeleteChildItem(row: { id: string }) {
    setDeleteSuccess && setDeleteSuccess(row);
  }

  useEffect(() => {
    setNewTableList(tableData);
  }, [tableData]);

  // Table column
  const { columns } = useReturnTableColumn({
    orderBy,
    pagination,
    searchParams,
    handleDeleteChildItem,
    setToggleDailog,
    setDepartmentInfoSetting,
    setEditItem,
    setOrderBy,
    getList,
  });

  return (
    <div className="h-full">
      <CustomTable
        columns={columns}
        data={newTableList}
        loading={false}
        ref={ref}
        height="200px"
        rowKey="userId"
        manualPagination={true}
      />
    </div>
  );
};
export default forwardRef(CreateAdminInnerTable);
