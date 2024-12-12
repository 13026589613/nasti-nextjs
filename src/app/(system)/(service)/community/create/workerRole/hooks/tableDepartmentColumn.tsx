"use client";
import { Column } from "@tanstack/react-table";

import { OrderByType, PaginationType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import Delete from "~/icons/DeleteIcon.svg";
import Edit from "~/icons/EditIcon.svg";

import { SearchParams, WorkerRoleDept } from "../types";

/**
 * @description: Department Table column props
 */
interface TableColumnProps {
  orderBy: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy: (value: OrderByType) => void;
  handleDeleteChildItem: (value: any) => void;
  setToggleDailog: (value: boolean) => void;
  setDepartmentInfoSetting?: (value: any) => void;
  setEditItem: (value: WorkerRoleDept | null) => void;
  getList: any;
  hideAction: boolean;
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
    handleDeleteChildItem,
    setToggleDailog,
    setDepartmentInfoSetting,
    // setEditItem,
    getList,
    hideAction,
  } = props;

  /**
   * @description Table columns config
   */
  const columns: CustomColumnDef<WorkerRoleDept>[] = [
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
            Department
          </div>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
    },

    // table column - hour
    {
      accessorKey: "hppdTargetHour",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("hppdTargetHour");
              return toggleSorting__(column);
            }}
          >
            HPPD Target Hours
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="">
            {row.getValue("hppdTargetHour") == ""
              ? "--"
              : row.getValue("hppdTargetHour")}
          </div>
        );
      },
    },
  ];
  if (!hideAction) {
    columns.push({
      id: "actions",
      header: () => <div className="text-center">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex gap-4 justify-center">
            <Tooltip content="Edit">
              <Edit
                className="cursor-pointer"
                width={16}
                color={"#EB1DB2"}
                onClick={() => {
                  // setEditItem(row.original);
                  setToggleDailog(false);
                  setDepartmentInfoSetting &&
                    setDepartmentInfoSetting(row.original);
                }}
              ></Edit>
            </Tooltip>
            <Tooltip content="Delete">
              <Delete
                className="cursor-pointer"
                width={16}
                color={"#13227A"}
                onClick={() => {
                  handleDeleteChildItem(row.original);
                }}
              ></Delete>
            </Tooltip>
          </div>
        );
      },
    });
  }

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
