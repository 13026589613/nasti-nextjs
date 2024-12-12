"use client";

import { OrderByType, PaginationType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import Delete from "~/icons/DeleteIcon.svg";

import { SearchParams } from "../types";

/**
 * @description: Department Table column props
 */
interface TableColumnProps {
  orderBy: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy: (value: OrderByType) => void;
  handleDeleteChildDpt: (value: any | null) => void;
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
  const { handleDeleteChildDpt } = props;

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

    {
      id: "actions",
      header: () => <div className="text-center">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex gap-4 justify-center">
            <Tooltip content="Delete">
              <Delete
                className="cursor-pointer"
                width={16}
                color={"#13227A"}
                onClick={() => {
                  handleDeleteChildDpt(row.original);
                }}
              ></Delete>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  //
  return {
    columns,
  };
};

export default useReturnTableColumn;
