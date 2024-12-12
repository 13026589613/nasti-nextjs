"use client";
import { Column } from "@tanstack/react-table";

import { OrderByType, PaginationType } from "@/api/types";
import AuthProvide from "@/components/custom/Auth";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalTime from "@/hooks/useGlobalTime";
import { convertTo12HourFormat } from "@/utils/convertTo12HourFormat";
import OpenEyeFillIcon from "~/icons/OpenEyeFillIcon.svg";
// import CicleErrorIcon from "~/icons/CicleErrorIcon.svg";
// import CicleTrueIcon from "~/icons/CicleTrueIcon.svg";
import ReviewIcon from "~/icons/ReviewIcon.svg";

import { EmployeesVo, SearchParams } from "../type";
interface TableColumnProps {
  orderBy: OrderByType;
  pagination: PaginationType;
  searchParams: SearchParams;
  setOrderBy: (value: OrderByType) => void;
  setDeleteDialogOpen?: (value: boolean) => void;
  setDeleteItem?: (value: EmployeesVo | null) => void;
  setEditDialogOpen: (value: boolean) => void;
  setEditItem: (value: EmployeesVo | null) => void;
  getList: any;
  setIsAdd: (value: boolean) => void;
  handleAction: (value: string, type: "view" | "edit") => void;
  handleCallDetails: (value: any) => void;
  setIsChild: (value: boolean) => void;
  defaultActiveKey: string;
}
const useReturnTableColumn = (props: TableColumnProps) => {
  const {
    defaultActiveKey,
    orderBy,
    pagination,
    searchParams,
    setOrderBy,
    getList,
    handleAction,
  } = props;
  const { UTCMoment } = useGlobalTime();

  const { attendanceEnabled } = useGlobalCommunityId();

  const formatCheckTime = (time: string | undefined) => {
    if (!time) return "";
    return UTCMoment(time).format("hh:mm A");
  };

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
  let columns: CustomColumnDef<EmployeesVo>[] = [];
  let firstColumns: CustomColumnDef<EmployeesVo>[] = [
    {
      accessorKey: "shiftDate",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("shiftDate");
              return toggleSorting__(column);
            }}
          >
            Shift Date
          </div>
        );
      },
      cell: ({ row }) => <div>{`${row.getValue("shiftDate")}`}</div>,
    },
    {
      accessorKey: "shiftTime",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("shiftTime");
              return toggleSorting__(column);
            }}
          >
            Shift Time
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("shiftTime")}</div>,
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("role");
              return toggleSorting__(column);
            }}
          >
            Role
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("role")}</div>,
    },
    {
      accessorKey: "checkInTime",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("checkInTime");
              return toggleSorting__(column);
            }}
          >
            Check In Time
          </div>
        );
      },
      cell: ({ row }) => {
        return <div>{formatCheckTime(row.original.checkInTime)}</div>;
      },
    },
    {
      accessorKey: "checkOutTime",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("checkOutTime");
              return toggleSorting__(column);
            }}
          >
            Check Out Time
          </div>
        );
      },
      cell: ({ row }) => (
        <div>{formatCheckTime(row.original.checkOutTime)}</div>
      ),
    },
  ];
  const lastColumns: CustomColumnDef<EmployeesVo>[] = [
    {
      accessorKey: "startDateTime",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("startDateTime");
              return toggleSorting__(column);
            }}
          >
            Start Date Time
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="">
          {convertTo12HourFormat(row.getValue("startDateTime"))}
        </div>
      ),
    },
    {
      accessorKey: "endDateTime",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("endDateTime");
              return toggleSorting__(column);
            }}
          >
            End Date Time
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="">
          {convertTo12HourFormat(row.getValue("endDateTime"))}
        </div>
      ),
    },
    {
      accessorKey: "reason",
      width: "40%",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("reason");
              return toggleSorting__(column);
            }}
          >
            Reason for Time Off
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-ellipsis overflow-hidden">
          {row.getValue("reason")}
        </div>
      ),
    },
  ];
  if (defaultActiveKey == "CurrentShifts") {
    columns = firstColumns.filter((item: any) => {
      if (!attendanceEnabled) {
        return (
          item.accessorKey !== "checkOutTime" &&
          item.accessorKey !== "checkInTime"
        );
      }
      return true;
    });
  } else if (defaultActiveKey == "PastShifts") {
    columns = [
      ...firstColumns.filter((item: any) => {
        if (!attendanceEnabled) {
          return (
            item.accessorKey !== "checkOutTime" &&
            item.accessorKey !== "checkInTime"
          );
        }
        return true;
      }),
      {
        accessorKey: "exception",
        header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer w-full h-full"
              onClick={() => {
                changeOrderBy("exception");
                return toggleSorting__(column);
              }}
            >
              Exception
            </div>
          );
        },
        cell: ({ row }) => <div>{row.original.exceptions}</div>,
      },
    ];
  } else if (defaultActiveKey == "timeOffRequests") {
    columns = [
      ...lastColumns,
      {
        id: "actions",
        header: () => <div className="text-center">Action</div>,
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <div
              style={{ width: "280px" }}
              className="flex gap-4 justify-center items-center h-7"
            >
              {/* <CicleTrueIcon
                className="cursor-pointer"
                width={16}
                color={"#3FBD6B"}
                onClick={() => {}}
              ></CicleTrueIcon>
              <CicleErrorIcon
                className="cursor-pointer"
                width={16}
                color={"var(--background-bg-destructive, #EF4444)"}
                onClick={() => {}}
              ></CicleErrorIcon> */}
              <AuthProvide
                invert={true}
                permissionName={"EMPLOYEE_MANAGEMENT_APPROVE_TIMEOFF"}
              >
                <Tooltip content="View">
                  <OpenEyeFillIcon
                    className="cursor-pointer mt-1"
                    width={16}
                    color={"#68B7B0"}
                    onClick={() => {
                      handleAction(row.original.id, "view");
                    }}
                  ></OpenEyeFillIcon>
                </Tooltip>
              </AuthProvide>
              <AuthProvide
                permissionName={"EMPLOYEE_MANAGEMENT_APPROVE_TIMEOFF"}
              >
                <Tooltip content="Review">
                  <ReviewIcon
                    className="cursor-pointer"
                    width={16}
                    onClick={() => handleAction(row.original.id, "edit")}
                  />
                </Tooltip>
              </AuthProvide>
            </div>
          );
        },
      },
    ];
  } else if (defaultActiveKey == "timeOffHistory") {
    columns = [
      ...lastColumns,
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <div className="flex items-center cursor-pointer w-full h-full">
              Status
            </div>
          );
        },
        cell: ({ row }) => {
          return (
            <div>
              {row.getValue("status") === "APPROVED" ? (
                <div className="h-[28px] w-[90px] rounded-[14px] flex justify-center items-center font-[390] bg-[#46DB7A1A]">
                  Approved
                </div>
              ) : (
                <div className="h-[28px] w-[90px] rounded-[14px] flex justify-center items-center  font-[390] bg-[#F55F4E1A]">
                  Rejected
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "arb",
        header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer w-full h-full"
              onClick={() => {
                changeOrderBy("arb");
                return toggleSorting__(column);
              }}
            >
              Approved/Rejected By
            </div>
          );
        },
        cell: ({ row }) => <div>{row.getValue("arb")}</div>,
      },
      {
        accessorKey: "arbdt",
        header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer w-full h-full"
              onClick={() => {
                changeOrderBy("arbdt");
                return toggleSorting__(column);
              }}
            >
              Approval/Rejection Date Time
            </div>
          );
        },
        cell: ({ row }) => <div>{row.getValue("arbdt")}</div>,
      },
    ];
  }

  return {
    columns,
  };
};
export default useReturnTableColumn;
