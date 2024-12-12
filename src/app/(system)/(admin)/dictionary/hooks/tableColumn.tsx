"use client";
import { Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { OrderByType, PaginationType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";
import { Checkbox } from "@/components/ui/checkbox";
import Delete from "~/icons/DeleteIcon.svg";
import Edit from "~/icons/EditIcon.svg";

import { DictinaryVo, SearchParams } from "../type";
interface TableColumnProps {
  orderBy: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy: (value: OrderByType) => void;
  setDeleteDialogOpen: (value: boolean) => void;
  setDeleteItem: (value: DictinaryVo | null) => void;
  setEditDialogOpen: (value: boolean) => void;
  setEditItem: (value: DictinaryVo | null) => void;
  getList: any;
}
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
  const changeOrderBy = (key: string) => {
    const index = orderBy.findIndex((item) => item.key === key);
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
    newOrderBy.map((item, index) => {
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

  const toggleSorting__ = (column: Column<any>) => {
    // column.toggleSorting(column.getIsSorted() === "asc");
  };
  const columns: CustomColumnDef<DictinaryVo>[] = [
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
      accessorKey: "description",
      header: ({ column }) => {
        return (
          // <Button
          //   variant="ghost"
          //   onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          // >
          //   Name
          //   <ArrowUpDown className="ml-2 h-4 w-4" />
          // </Button>
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("description");
              return toggleSorting__(column);
            }}
          >
            Name <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("description")}</div>
      ),
    },
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
            Type <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("code")}</div>
      ),
    },

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

  return {
    columns,
  };
};
export default useReturnTableColumn;
