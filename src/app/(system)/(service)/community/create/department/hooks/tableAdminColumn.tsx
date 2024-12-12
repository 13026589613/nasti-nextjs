"use client";
import { OrderByType, PaginationType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { Checkbox } from "@/components/ui/checkbox";

import { DepartmentVo, SearchParams } from "../types";
interface TableColumnProps {
  orderBy: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy: (value: OrderByType) => void;
  getList: any;
  isAdmin: boolean;
}
const useReturnTableColumn = (props: TableColumnProps) => {
  const { isAdmin } = props;

  let columns: CustomColumnDef<DepartmentVo>[] = [
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
          <div className="flex overflow-hidden break-words">
            <Tooltip
              classContentName="w-[100vw] break-words"
              content={
                <div className="flex flex-wrap gap-[5px]">
                  {listDepartment != null
                    ? (listDepartment as []).map((item: any, index: number) => (
                        <div key={index}>
                          {item +
                            (listDepartment.length > 1 &&
                            index < listDepartment.length - 1
                              ? ","
                              : "")}
                        </div>
                      ))
                    : ""}
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
