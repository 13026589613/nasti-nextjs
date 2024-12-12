"use client";
import { Column } from "@tanstack/react-table";

import { OrderByType, PaginationType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";
import { Checkbox } from "@/components/ui/checkbox";
import Delete from "~/icons/DeleteIcon.svg";
import Edit from "~/icons/EditIcon.svg";

import { CompanyVo, SearchParams } from "../types";

/**
 * @description: Company Table column props
 */
interface TableColumnProps {
  orderBy: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy: (value: OrderByType) => void;
  setDeleteDialogOpen: (value: boolean) => void;
  setDeleteItem: (value: CompanyVo | null) => void;
  setEditDialogOpen: (value: boolean) => void;
  setEditItem: (value: CompanyVo | null) => void;
  getList: any;
}

/**
 * @description: Company Table column hook
 * @param props
 * @returns
 */
const useReturnTableColumn = (props: TableColumnProps) => {
  const {
    orderBy,
    pagination,
    searchParams,
    setOrderBy,
    setDeleteDialogOpen,
    setDeleteItem,
    setEditDialogOpen,
    setEditItem,
    getList,
  } = props;

  /**
   * @description Table columns config
   */
  const columns: CustomColumnDef<CompanyVo>[] = [
    // select checkbox
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
    // table column - name
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
            Company Name
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("name")}</div>
      ),
    },
    // table column - createdAt
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("createdAt");
              return toggleSorting__(column);
            }}
          >
            Created At Time
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("createdAt")}</div>
      ),
    },
    // table column - createdBy
    {
      accessorKey: "createdBy",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("createdBy");
              return toggleSorting__(column);
            }}
          >
            Created By User
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("createdBy")}</div>
      ),
    },
    // table column - isDeleted
    {
      accessorKey: "isDeleted",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("isDeleted");
              return toggleSorting__(column);
            }}
          >
            Status
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">
          {row.getValue("isDeleted") == false ? (
            <div className="border-spacing-4 border-cyan-500 border-2 rounded-full w-28 h-8 flex justify-center items-center font-weight-bold text-cyan-500">
              Active
            </div>
          ) : (
            <div className="border-spacing-4 border-red-500 border-2 rounded-full w-28 h-8 flex justify-center items-center font-weight-bold text-red-500">
              Deleted
            </div>
          )}
        </div>
      ),
    },
    // action's btn
    {
      id: "actions",
      header: () => <div className="text-center">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex gap-4 justify-center">
            <Edit
              className="cursor-pointer"
              width={16}
              color={"#EB1DB2"}
              onClick={() => {
                setEditItem(row.original);
                setEditDialogOpen(true);
              }}
            ></Edit>
            <Delete
              className="cursor-pointer"
              width={16}
              color={"#13227A"}
              onClick={() => {
                setDeleteItem(row.original);
                setDeleteDialogOpen(true);
              }}
            ></Delete>
          </div>
        );
      },
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
