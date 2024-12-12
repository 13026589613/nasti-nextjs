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

import { DepartmentVo, SearchParams } from "../types";

/**
 * @description: Department Table column props
 */
interface TableColumnProps {
  orderBy: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy: (value: OrderByType) => void;
  setDeleteDialogOpen: (value: boolean) => void;
  setDeleteItem: (value: DepartmentVo | null) => void;
  setEditDialogOpen: (value: boolean) => void;
  setEditItem: (value: DepartmentVo | null) => void;
  getList: any;
  setCheckOpen: (value: boolean) => void;
  setEnabledDialogOpen: (value: boolean) => void;
  getSingleInfo: (value: DepartmentVo) => void;
}

/**
 * @description: Department Table column hook
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
  /**
   * @description Table columns config
   */
  const columns: CustomColumnDef<DepartmentVo>[] = [
    // table column - name
    {
      accessorKey: "name",
      width: "10%",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              // changeOrderBy("name");
              // return toggleSorting__(column);
            }}
          >
            Department Name
          </div>
        );
      },
      cell: ({ row }) => (
        <div className=" break-words">{row.getValue("name")}</div>
      ),
    },
    // table column - description
    {
      accessorKey: "description",
      width: "20%",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {}}
          >
            Department Description
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="break-words w-[280px]">
          {row.getValue("description")}
        </div>
      ),
    },
    // table column - location
    {
      accessorKey: "locationList",
      width: "12%",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              // changeOrderBy("locationList");
              // return toggleSorting__(column);
            }}
          >
            Location
          </div>
        );
      },
      cell: ({ row }) => {
        const listDepartment: [] = row.getValue("locationList");
        return (
          <div className="flex flex-wrap gap-[5px]">
            {listDepartment != null && listDepartment.length > 0
              ? (listDepartment as []).map((item: any, index: number) => (
                  <div className="break-words w-full" key={index}>
                    {item &&
                      item.locationName +
                        (listDepartment.length > 1 &&
                        index < listDepartment.length - 1
                          ? ","
                          : "")}
                  </div>
                ))
              : "--"}
          </div>
        );
      },
    },
    // table column - isHppd
    {
      accessorKey: "isHppd",
      width: "15%",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer" onClick={() => {}}>
            Schedule Based On HPPD
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="">{row.getValue("isHppd") ? "Yes" : "No"}</div>
      ),
    },

    // table column - isReportPbjHour
    {
      accessorKey: "isReportPbjHour",
      width: "10%",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              // changeOrderBy("isReportPbjHour");
              // return toggleSorting__(column);
            }}
          >
            Report PBJ Hours
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="">
            {row.getValue("isReportPbjHour") ? "Yes" : "No"}
          </div>
        );
      },
    },

    // table column - Track Census
    {
      accessorKey: "isTrackCensus",
      width: "8%",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              // return toggleSorting__(column);
            }}
          >
            Track Census
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="">{row.getValue("isTrackCensus") ? "Yes" : "No"}</div>
        );
      },
    },

    // table column - status
    {
      accessorKey: "isEnabled",
      width: "15%",
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
                invert={true}
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
                        // getSingleInfo(row.original);
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
            ) : (
              ""
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

  // onboarding page remove status colmun
  pathname === "/myCommunity" ? columns : columns.splice(6, 1);
  return {
    columns,
  };
};

export default useReturnTableColumn;
