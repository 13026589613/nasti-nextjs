"use client";

import AuthProvide from "@/components/custom/Auth";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { EXCEPTION_REASON } from "@/constant/statusConstants";
import useGlobalTime from "@/hooks/useGlobalTime";
import LocationIcon from "~/icons/locationIcon.svg";
import OpenEyeFillIcon from "~/icons/OpenEyeFillIcon.svg";
// import MessageIcon from "~/images/MessageIcon.svg";
import ReviewIcon from "~/images/ReviewIcon.svg";

import { ExceptionsVo } from "../types";

export type AdminUserIconType = "reject" | "approve" | "rejected" | "approved";
/**
 * @description: UserCommunityRef Table column props
 */
interface TableColumnProps {
  clickIcon: (data: ExceptionsVo, type: "view" | "edit") => void;
  checkLocation?: (data: ExceptionsVo) => void;
}

/**
 * @description: UserCommunityRef Table column hook
 * @param props
 * @returns
 */
const useReturnTimeOffTableColumn = ({
  clickIcon,
  checkLocation,
}: TableColumnProps) => {
  const { zoneAbbr } = useGlobalTime();
  const columns: CustomColumnDef<ExceptionsVo>[] = [
    {
      accessorKey: "departmentName",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer">Department</div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("departmentName")}</div>,
    },
    {
      accessorKey: "roleName",
      header: () => {
        return <div className="flex items-center cursor-pointer">Role</div>;
      },
      cell: ({ row }) => <div>{row.original.workerRoleName}</div>,
    },
    {
      accessorKey: "employee",
      header: () => {
        return <div className="flex items-center cursor-pointer">Employee</div>;
      },
      cell: ({ row }) => <div>{row.original.username}</div>,
    },
    {
      accessorKey: "shiftDate",
      width: "24%",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer">
            Shift Date Time
          </div>
        );
      },
      cell: ({ row }) => {
        const { startTimeLocal, endTimeLocal } = row.original;
        return (
          <div>
            {startTimeLocal && endTimeLocal
              ? `${startTimeLocal} - ${endTimeLocal} (${zoneAbbr})`
              : ""}
          </div>
        );
      },
    },
    {
      accessorKey: "checkInTimeLocal",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer">Check-in Time</div>
        );
      },
      cell: ({ row }) => (
        <div>
          {row.original.checkInTimeLocal
            ? `${row.original.checkInTimeLocal} (${zoneAbbr})`
            : ""}
        </div>
      ),
    },
    {
      accessorKey: "checkOutTimeLocal",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer">Check-out Time</div>
        );
      },
      cell: ({ row }) => (
        <div>
          {row.original.checkOutTimeLocal
            ? `${row.original.checkOutTimeLocal} (${zoneAbbr})`
            : ""}
        </div>
      ),
    },
    // {
    //   accessorKey: "status",
    //   width: "12%",
    //   header: () => {
    //     return (
    //       <div className="flex items-center cursor-pointer w-full h-full">
    //         Status
    //       </div>
    //     );
    //   },
    //   cell: ({ row }) => <div>{EXCEPTION_REASON[row.original.status]}</div>,
    // },
    {
      accessorKey: "reason",
      enableHiding: false,
      header: () => {
        return (
          <div className="flex items-center cursor-pointer">
            Exception Reason
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <div className="mr-4">
              {
                EXCEPTION_REASON[
                  row.original.status.includes("BREAK_TIME")
                    ? "BREAK_TIME_EXCEPTION"
                    : row.original.status
                ]
              }
            </div>
            {["Late Check In", "Early Check Out", "Late Check Out"].includes(
              EXCEPTION_REASON[row.original.status]
            ) && (
              <LocationIcon
                width={16}
                height={16}
                className="cursor-pointer origin-center"
                onClick={() => {
                  checkLocation && checkLocation(row.original);
                }}
              ></LocationIcon>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex gap-4 justify-center">
            <AuthProvide
              permissionName={"SCHEDULE_MANAGEMENT_APPROVE_ATTENDANCE"}
            >
              <Tooltip content="Review">
                <ReviewIcon
                  className="cursor-pointer mt-1"
                  width={16}
                  color={"#68B7B0"}
                  onClick={() => {
                    clickIcon(row.original, "edit");
                  }}
                ></ReviewIcon>
              </Tooltip>
            </AuthProvide>
            <AuthProvide
              permissionName={"SCHEDULE_MANAGEMENT_APPROVE_ATTENDANCE"}
              invert={true}
            >
              <Tooltip content="View">
                <OpenEyeFillIcon
                  className="cursor-pointer mt-1"
                  width={16}
                  color={"#68B7B0"}
                  onClick={() => {
                    clickIcon(row.original, "view");
                  }}
                ></OpenEyeFillIcon>
              </Tooltip>
            </AuthProvide>
          </div>
        );
      },
    },
  ];
  const columns_edit: CustomColumnDef<ExceptionsVo>[] = columns;
  const columns_view: CustomColumnDef<ExceptionsVo>[] = [
    ...columns.filter((column, index) => index !== 7),
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex gap-4 justify-center">
            <Tooltip content="View">
              <OpenEyeFillIcon
                className="cursor-pointer mt-1"
                width={16}
                color={"#68B7B0"}
                onClick={() => {
                  clickIcon(row.original, "view");
                }}
              ></OpenEyeFillIcon>
            </Tooltip>
          </div>
        );
      },
    },
  ];
  //
  return {
    columns_edit,
    columns_view,
  };
};

export default useReturnTimeOffTableColumn;
