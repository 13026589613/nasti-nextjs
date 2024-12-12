"use client";

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

import { SearchParams, WorkerRoleVo } from "../types";

/**
 * @description: WorkerRole Table column props
 */
interface TableColumnProps {
  orderBy: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy: (value: OrderByType) => void;
  setDeleteDialogOpen: (value: boolean) => void;
  setDeleteItem: (value: WorkerRoleVo | null) => void;
  setEditDialogOpen: (value: boolean) => void;
  setEditItem: (value: WorkerRoleVo | null) => void;
  getList: any;
  setCheckOpen: (value: boolean) => void;
  checkOpen: any;
  setEnabledDialogOpen: (value: boolean) => void;
  getSingleInfo: (value: WorkerRoleVo) => void;
}

/**
 * @description: WorkerRole Table column hook
 * @param props
 * @returns
 */
const useReturnTableColumn = (props: TableColumnProps) => {
  const {
    setDeleteDialogOpen,
    setDeleteItem,
    setEditDialogOpen,
    setEditItem,
    setCheckOpen,
    setEnabledDialogOpen,
    getSingleInfo,
  } = props;

  const pathname = usePathname();
  /**s
   * @description Table columns config
   */
  const columns: CustomColumnDef<WorkerRoleVo>[] = [
    // table column - companyId
    {
      accessorKey: "name",
      width: "15%",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              // changeOrderBy("name");
              // return toggleSorting__(column);
            }}
          >
            Role Name
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="break-words">{row.getValue("name")}</div>
      ),
    },
    // table column - code
    {
      accessorKey: "code",
      width: "10%",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              // changeOrderBy("code");
              // return toggleSorting__(column);
            }}
          >
            Job Code
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-[120px]">{row.getValue("code")}</div>
      ),
    },
    // table column - color
    {
      accessorKey: "color",
      width: "15%",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              // changeOrderBy("name");
              // return toggleSorting__(column);
            }}
          >
            Role Color
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="w-[260px]justify-center flex">
          <div
            className={`w-[18px] h-[18px]`}
            style={{ background: row.getValue("color"), marginLeft: "10px" }}
          ></div>
          <div
            className={`text-[${row.getValue("color")}]`}
            style={{ marginLeft: "10px" }}
          >
            {row.getValue("color")}
          </div>
        </div>
      ),
    },
    // table column - departments
    {
      accessorKey: "departmentWorkRoleVos",
      width: "30%",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              // changeOrderBy("departmentWorkRoleVos");
              // return toggleSorting__(column);
            }}
          >
            Departments
          </div>
        );
      },
      cell: ({ row }) => {
        const list: any = row.getValue("departmentWorkRoleVos");
        return (
          <div className="flex flex-col">
            {list.map((item: any, index: number) => {
              let hppdTargetHour = "--";
              if (item.hppdTargetHour) {
                hppdTargetHour =
                  Number(item.hppdTargetHour) % 1 !== 0
                    ? Number(item.hppdTargetHour).toFixed(2)
                    : Number(item.hppdTargetHour).toFixed(0);
              }
              return (
                <div
                  className="flex items-center w-[560px] break-words"
                  key={index}
                >
                  {item.departmentName}{" "}
                  {item.isHppd ? ` (HPPD Target ${hppdTargetHour})` : ""}{" "}
                  {index < list.length - 1 ? " / " : " "}
                </div>
              );
            })}
          </div>
        );
      },
    },

    // table column - status
    {
      accessorKey: "isEnabled",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              // changeOrderBy("isEnabled");
              // return toggleSorting__(column);
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
            {pathname === "/myCommunity" && (
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
                      getSingleInfo(row.original);
                      setCheckOpen(true);
                    }}
                  ></CheckIcon>
                </Tooltip>
              </AuthProvide>
            )}

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
                    getSingleInfo(row.original);
                    setEditDialogOpen(true);
                  }}
                ></Edit>
              </Tooltip>
            </AuthProvide>

            {pathname === "/myCommunity" ? (
              row.getValue("isEnabled") == true ? (
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
              )
            ) : null}

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

  //
  pathname === "/myCommunity" ? columns : columns.splice(4, 1);
  return {
    columns,
  };
};

export default useReturnTableColumn;
