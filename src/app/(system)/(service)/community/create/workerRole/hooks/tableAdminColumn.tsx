"use client";

import { OrderByType, PaginationType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { Checkbox } from "@/components/ui/checkbox";

import { SearchParams, WorkerRoleVo } from "../types";
interface TableColumnProps {
  orderBy?: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy?: (value: OrderByType) => void;
  getList?: any;
  isAdmin: boolean;
}
const useReturnTableColumn = (props: TableColumnProps) => {
  const { isAdmin } = props;

  let columns: CustomColumnDef<WorkerRoleVo>[] = [
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
      cell: ({ row }) => <div>{row.getValue("username")}</div>,
    },
  ];
  if (isAdmin) {
    columns.push({
      accessorKey: "permissionList",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Permissions
          </div>
        );
      },
      cell: ({ row }) => {
        const listDepartment: [] = row.getValue("permissionList");
        return (
          <div className="flex overflow-hidden">
            <Tooltip
              content={
                <div className="w-full">
                  <div className="flex flex-wrap text-wrap text-ellipsis overflow-hidden">
                    {listDepartment}
                  </div>
                </div>
              }
            >
              {listDepartment != null
                ? listDepartment.slice(0, 1) +
                  (listDepartment.length > 1 ? "..." : "")
                : ""}
            </Tooltip>
          </div>
        );
      },
    });
  }

  return {
    columns,
  };
};
export default useReturnTableColumn;
