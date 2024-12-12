"use client";
import { Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { OrderByType, PaginationType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";
import { Checkbox } from "@/components/ui/checkbox";
import Delete from "~/icons/DeleteIcon.svg";
import Edit from "~/icons/EditIcon.svg";

import { PbjJobVo, SearchParams } from "../types";

/**
 * @description: PbjJob Table column props
 */
interface TableColumnProps {
  orderBy: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy: (value: OrderByType) => void;
  setDeleteDialogOpen: (value: boolean) => void;
  setDeleteItem: (value: PbjJobVo | null) => void;
  setEditDialogOpen: (value: boolean) => void;
  setEditItem: (value: PbjJobVo | null) => void;
  getList: any;
}

/**
 * @description: PbjJob Table column hook
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
  const columns: CustomColumnDef<PbjJobVo>[] = [
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
    // table column - code
    {
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("code");
              return toggleSorting__(column);
            }}
          >
            code <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("code")}</div>
      ),
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
            name <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("name")}</div>
      ),
    },
    // table column - isSystem
    {
      accessorKey: "isSystem",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("isSystem");
              return toggleSorting__(column);
            }}
          >
            isSystem <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("isSystem")}</div>
      ),
    },
    // table column - companyId
    {
      accessorKey: "companyId",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("companyId");
              return toggleSorting__(column);
            }}
          >
            companyId <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("companyId")}</div>
      ),
    },
    // table column - communityId
    {
      accessorKey: "communityId",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("communityId");
              return toggleSorting__(column);
            }}
          >
            communityId <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("communityId")}</div>
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
