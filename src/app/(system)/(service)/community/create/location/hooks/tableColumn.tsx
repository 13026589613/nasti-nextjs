"use client";

import { Column } from "@tanstack/react-table";
import { usePathname } from "next/navigation";

import { OrderByType, PaginationType } from "@/api/types";
import AuthProvide from "@/components/custom/Auth";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import CheckIcon from "~/icons/CheckIcon.svg";
import CicleErrorIcon from "~/icons/CicleErrorIcon.svg";
import CicleTrueIcon from "~/icons/CicleTrueIcon.svg";
import Delete from "~/icons/DeleteIcon.svg";
import Edit from "~/icons/EditIcon.svg";

import { LocationVo, SearchParams } from "../types";

/**
 * @description: Location Table column props
 */
interface TableColumnProps {
  orderBy: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy: (value: OrderByType) => void;
  setDeleteDialogOpen: (value: boolean) => void;
  setDeleteItem: (value: LocationVo | null) => void;
  setEditDialogOpen: (value: boolean) => void;
  setEditItem: (value: LocationVo | null) => void;
  getList: any;
  setCheckOpen: (value: boolean) => void;
  setEnabledDialogOpen: (value: boolean) => void;
}

/**
 * @description: Location Table column hook
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
    setCheckOpen,
    setEnabledDialogOpen,
  } = props;
  const pathname = usePathname();
  /**
   * @description Table columns config
   */
  const columns: CustomColumnDef<LocationVo>[] = [
    // table column - name
    {
      accessorKey: "name",
      width: "30%",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Location Name
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="break-words">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      width: "30%",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Location Description
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="break-words">{row.getValue("description")}</div>
      ),
    },
    // table column - status
    {
      accessorKey: "isEnabled",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("isEnabled");
              return toggleSorting__(column);
            }}
          >
            Status
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="">
          {row.getValue("isEnabled") == true ? (
            <div className="border-spacing-4 border-cyan-500 border-2 rounded-full w-28 h-8 flex justify-center items-center font-weight-bold text-cyan-500">
              Active
            </div>
          ) : (
            <div className="border-spacing-4 border-red-500 border-2 rounded-full w-28 h-8 flex justify-center items-center font-weight-bold text-red-500">
              Inactive
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
            <AuthProvide
              invert
              authenticate={pathname === "/myCommunity"}
              permissionName="COMMUNITY_MANAGEMENT_EDIT"
            >
              <Tooltip content="View">
                <CheckIcon
                  className="cursor-pointer"
                  width={16}
                  color={"#68B7B0"}
                  onClick={() => {
                    const item = row.original;
                    setEditItem({
                      ...item,
                    });
                    setCheckOpen(true);
                  }}
                ></CheckIcon>
              </Tooltip>
            </AuthProvide>

            <AuthProvide
              authenticate={pathname === "/myCommunity"}
              permissionName="COMMUNITY_MANAGEMENT_EDIT"
            >
              <Tooltip content="Edit">
                <Edit
                  className="cursor-pointer"
                  width={16}
                  color={"#EB1DB2"}
                  onClick={() => {
                    setEditItem(row.original);
                    setEditDialogOpen(true);
                  }}
                ></Edit>
              </Tooltip>
            </AuthProvide>

            {row.getValue("isEnabled") == true ? (
              <AuthProvide
                authenticate={pathname === "/myCommunity"}
                permissionName="COMMUNITY_MANAGEMENT_EDIT"
              >
                <Tooltip content="Disable">
                  <CicleErrorIcon
                    className="cursor-pointer"
                    width={16}
                    color={"#EF4444"}
                    onClick={() => {
                      const item = row.original;
                      setEditItem({
                        ...item,
                      });
                      setEnabledDialogOpen(true);
                    }}
                  ></CicleErrorIcon>
                </Tooltip>
              </AuthProvide>
            ) : (
              <AuthProvide
                authenticate={pathname === "/myCommunity"}
                permissionName="COMMUNITY_MANAGEMENT_EDIT"
              >
                <Tooltip content="Enable">
                  <CicleTrueIcon
                    className="cursor-pointer"
                    width={16}
                    color={"#68B7B0"}
                    onClick={() => {
                      const item = row.original;
                      setEditItem({
                        ...item,
                      });
                      setEnabledDialogOpen(true);
                    }}
                  ></CicleTrueIcon>
                </Tooltip>
              </AuthProvide>
            )}
            <AuthProvide
              authenticate={pathname === "/myCommunity"}
              permissionName="COMMUNITY_MANAGEMENT_EDIT"
            >
              <Tooltip content="Delete">
                <Delete
                  className="cursor-pointer"
                  width={16}
                  color={"#13227A"}
                  onClick={() => {
                    setDeleteItem(row.original);
                    setDeleteDialogOpen(true);
                  }}
                ></Delete>
              </Tooltip>
            </AuthProvide>
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
