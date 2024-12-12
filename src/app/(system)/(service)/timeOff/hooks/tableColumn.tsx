"use client";
import { Row } from "@tanstack/react-table";

import AuthProvide from "@/components/custom/Auth";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import OpenEyeFillIcon from "~/icons/OpenEyeFillIcon.svg";
import MessageIcon from "~/images/MessageIcon.svg";
import ReviewIcon from "~/images/ReviewIcon.svg";

import ChatIcon from "../../shiftsNeedHelp/components/ChatIcon";
import { Department, TimeOffVo } from "../types";

export type AdminUserIconType = "rejected" | "approved";
/**
 * @description: UserCommunityRef Table column props
 */
interface TableColumnProps {
  selectedRows: string[];
  setSelectedRows: (value: string[]) => void;
  clickIcon: (icon: string, data: TimeOffVo, timeOffId?: string) => void;
}

/**
 * @description: UserCommunityRef Table column hook
 * @param props
 * @returns
 */
const useReturnTimeOffTableColumn = ({
  selectedRows,
  setSelectedRows,
  clickIcon,
}: TableColumnProps) => {
  const { UTCMoment, zoneAbbr } = useGlobalTime();
  const handleAllCheck = (value: boolean, data: TimeOffVo[]) => {
    if (!value) {
      const res = selectedRows.filter((item) => {
        for (let index = 0; index < data.length; index++) {
          const element = data[index];
          if (element.id === item) {
            return false;
          }
        }
        return true;
      });
      setSelectedRows(res);
    } else {
      let resData = data.filter((item) => {
        for (let index = 0; index < selectedRows.length; index++) {
          const element = selectedRows[index];
          if (element === item.id) {
            return false;
          }
        }
        return true;
      });
      const res = resData.map((item) => item.id);
      setSelectedRows([...res, ...selectedRows]);
    }
  };

  const handleCheck = (value: boolean, id: string) => {
    if (!value) {
      const res = selectedRows.filter((item) => item !== id);
      setSelectedRows(res);
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };
  const columns: CustomColumnDef<TimeOffVo>[] = [
    // select checkbox
    {
      id: "select",
      width: 50,
      header: ({ table }) => {
        const data: TimeOffVo[] = table.options.data;
        const selectLength = table.getSelectedRowModel().rows;

        const isAllSelected = selectLength.length === data.length;
        let checked: boolean | "indeterminate" = false;

        if (selectLength.length === 0) {
          checked = false;
        } else {
          checked = isAllSelected ? true : "indeterminate";
        }
        return (
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => {
              handleAllCheck(value as boolean, data);
              table.toggleAllPageRowsSelected(!!value);
            }}
            aria-label="Select all"
          />
        );
      },
      cell: ({ row }) => (
        <CheckboxColumn onChange={handleCheck} row={row}></CheckboxColumn>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "firstName",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            First Name
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("firstName")}</div>,
    },
    {
      accessorKey: "lastName",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Last Name
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
    },
    {
      accessorKey: "id",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Department
          </div>
        );
      },
      cell: ({ row }) => {
        const { departments } = row.original;

        const departmentName = departments
          ? departments.map((item: Department) => item.name).join(", ")
          : "-";
        return <div>{departmentName}</div>;
      },
    },
    {
      accessorKey: "roleName",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Role
          </div>
        );
      },
      cell: ({ row }) => {
        const { workerRoles } = row.original;
        const roleName = workerRoles
          ? workerRoles.map((item) => item.name).join(", ")
          : "-";
        return <div>{roleName}</div>;
      },
    },
    {
      accessorKey: "startDate",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Start Date Time
          </div>
        );
      },
      cell: ({ row }) => {
        const { startTimeUtc } = row.original;
        let string = ``;

        if (startTimeUtc) {
          string = `${UTCMoment(startTimeUtc).format(
            "MM/DD/YYYY hh:mm A"
          )} (${zoneAbbr})`;
        }
        return <div>{string}</div>;
      },
    },
    {
      accessorKey: "endDate",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            End Date Time
          </div>
        );
      },
      cell: ({ row }) => {
        const { endTimeUtc } = row.original;
        let string = ``;

        if (endTimeUtc) {
          string = `${UTCMoment(endTimeUtc).format(
            "MM/DD/YYYY hh:mm A"
          )} (${zoneAbbr})`;
        }
        return <div>{string}</div>;
      },
    },
    {
      width: "20%",
      accessorKey: "reason",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Reason for Time Off
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("reason")}</div>,
    },
    {
      width: 120,
      accessorKey: "status",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Status
          </div>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <div
            className={cn(
              "flex items-center h-[28px] w-auto rounded-[14px] px-[10px] text-[16px] font-[390] text-[#919FB4] leading-[28px]",
              status === "APPROVED" ? "bg-[#46DB7A1A]" : "bg-[#F55F4E1A]"
            )}
          >
            {status === "APPROVED" ? "Approved" : "Rejected"}
          </div>
        );
      },
    },
    {
      id: "actions",
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
                  clickIcon("view", row.original);
                }}
              ></OpenEyeFillIcon>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const lessIndex = [11, 10, 9, 8];

  const columnsLess = columns.filter(
    (item, index) => !lessIndex.includes(index)
  );
  columnsLess[8] = {
    id: "actions",
    header: () => <div className="text-center">Action</div>,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex gap-4 justify-center">
          <AuthProvide
            invert
            permissionName={"EMPLOYEE_MANAGEMENT_APPROVE_TIMEOFF"}
          >
            <Tooltip content="View">
              <OpenEyeFillIcon
                className="cursor-pointer mt-1"
                width={16}
                color={"#68B7B0"}
                onClick={() => {
                  clickIcon("view", row.original);
                }}
              ></OpenEyeFillIcon>
            </Tooltip>
          </AuthProvide>
          <AuthProvide permissionName={"EMPLOYEE_MANAGEMENT_APPROVE_TIMEOFF"}>
            <Tooltip content="Review">
              <ReviewIcon
                className="cursor-pointer mt-1"
                width={16}
                color={"#68B7B0"}
                onClick={() => {
                  clickIcon("review", row.original, row.id);
                }}
              ></ReviewIcon>
            </Tooltip>
          </AuthProvide>

          <Tooltip content="Message">
            <ChatIcon
              targetUserId={row.original.userId}
              chatIcon={
                <MessageIcon
                  className="cursor-pointer mt-1"
                  width={16}
                  color={"#68B7B0"}
                ></MessageIcon>
              }
            ></ChatIcon>
          </Tooltip>
        </div>
      );
    },
  };

  //
  return {
    columns: columns.filter((item, index) => index !== 0),
    columnsLess,
  };
};

export default useReturnTimeOffTableColumn;

const CheckboxColumn = (props: {
  row: Row<TimeOffVo>;
  onChange: (value: boolean, id: string) => void;
}) => {
  const { row, onChange } = props;
  // useEffect(() => {
  //   row.toggleSelected(false);
  // }, [row.getIsSelected()]);
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => {
        onChange(value as boolean, row.original.id);
        row.toggleSelected(!!value);
      }}
      aria-label="Select row"
    />
  );
};
