"use client";
import { Column } from "@tanstack/react-table";

import { OrderByType, PaginationType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";
import { Checkbox } from "@/components/ui/checkbox";

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
  setToggleDailog: (value: boolean) => void;
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
  const {
    orderBy,
    pagination,
    searchParams,
    setOrderBy,
    // setDeleteDialogOpen,
    // setDeleteItem,
    // setToggleDailog,
    // setDepartmentInfoSetting,
    // setEditItem,
    getList,
  } = props;

  /**
   * @description Table columns config
   */
  const columns: CustomColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("name");
              return toggleSorting__(column);
            }}
          >
            Name
          </div>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("name");
              return toggleSorting__(column);
            }}
          >
            Permissions
          </div>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
    },
  ];

  /**
   * @description: Change order by
   * @param key
   */
  const changeOrderBy = (key: string) => {
    const index = orderBy.findIndex((item: any) => item.key === key);
    let newOrderBy: OrderByType = [];
    if (index !== -1) {
      newOrderBy.push({
        key,
        order: orderBy[index].order === "asc" ? "desc" : "asc",
      });

      setOrderBy(newOrderBy);
    } else {
      newOrderBy = [{ key, order: "asc" }];
      setOrderBy([{ key, order: "asc" }]);
    }

    let orderByNew = "";
    newOrderBy.map((item: any, index: number) => {
      if (index === orderBy.length - 1) {
        orderByNew += `${item.key} ${item.order}`;
      } else {
        orderByNew += `${item.key} ${item.order},`;
      }
    });
    getList({
      ...searchParams,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      orderBy: orderByNew,
    });
  };

  /**
   * @description Toggle sort setting
   * @param column
   */
  const toggleSorting__ = (column: Column<any>) => {
    // column.toggleSorting(column.getIsSorted() === "asc");
  };

  //
  return {
    columns,
  };
};

export default useReturnTableColumn;
