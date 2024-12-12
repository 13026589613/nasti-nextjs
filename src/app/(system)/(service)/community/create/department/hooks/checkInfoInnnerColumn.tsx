"use client";

import { OrderByType, PaginationType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";

import { SearchParams } from "../types";

/**
 * @description: Department Table column props
 */
interface TableColumnProps {
  orderBy: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy: (value: OrderByType) => void;
  setDeleteDialogOpen: (value: boolean) => void;
  setDeleteItem: (value: any | null) => void;
  setToggleDailog?: (value: boolean) => void;
  setDepartmentInfoSetting?: () => void;
  setEditItem: (value: any | null) => void;
  getList: any;
}

/**
 * @description: Department Table column hook
 * @param props
 * @returns
 */
const useReturnTableColumn = (props: TableColumnProps) => {
  /**
   * @description Table columns config
   */
  const columns: CustomColumnDef<any>[] = [
    {
      accessorKey: "username",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Name
          </div>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue("username")}</div>,
    },
  ];

  //
  return {
    columns,
  };
};

export default useReturnTableColumn;
