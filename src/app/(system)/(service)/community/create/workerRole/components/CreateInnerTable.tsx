"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";

import { OrderByType, PaginationType } from "@/api/types";
import CustomTable, { RefProps } from "@/components/custom/Table";

import useReturnTableColumn from "../hooks/tableDepartmentColumn";
import { SearchParams, WorkerRoleDept, WorkerRoleVo } from "../types";

/**
 * @description Department List Manager Page
 * @returns
 */
interface DepartmentPageProps {
  hideAction: boolean;
  setToggleDailog: (value: boolean) => void;
  // deleteTableRow: (value: boolean) => void;
  setEditItem: (value: unknown) => void;
  setDeleteSuccess?: (value: unknown) => void;
  setDepartmentInfoSetting?: (value: any) => void;
  communityId: string;
  tableData: WorkerRoleDept[];
}
export default function DepartmentPage(props: DepartmentPageProps) {
  const {
    tableData,
    setToggleDailog,
    setDepartmentInfoSetting,
    setEditItem,
    hideAction,
    setDeleteSuccess,
  } = props;
  const [newTableList, setNewTableList] = useState<WorkerRoleDept[]>(tableData);
  const tableRef = useRef<RefProps>(); // Table ref
  // const [editDialogOpen, setEditDialogOpen] = useState(false); // Edit dialog open
  const [_data, _setData] = useState<WorkerRoleVo[]>([]); // Data
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
    isHppd: "",
    isReportPbjHour: "",
  });

  /**
   * @description API - Load ListData By Params
   * @param params
   */
  const getList = async (params?: any) => {};

  useEffect(() => {
    setNewTableList(tableData);
  }, [tableData]);

  // Table column
  const { columns } = useReturnTableColumn({
    orderBy,
    pagination,
    searchParams,
    setToggleDailog,
    setDepartmentInfoSetting,
    setEditItem,
    setOrderBy,
    getList,
    hideAction,
    handleDeleteChildItem,
  });
  function handleDeleteChildItem(row: { id: string }) {
    setDeleteSuccess && setDeleteSuccess(row);
  }
  return (
    <div className="h-full">
      <CustomTable
        columns={columns}
        data={newTableList}
        loading={false}
        adaptive={false}
        height="240px"
        ref={tableRef}
        manualPagination={true}
      />
    </div>
  );
}
