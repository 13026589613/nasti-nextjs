"use client";

import { CompanyVo } from "@/api/admin/company/type";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { ADMIN_USER_STATUS_COLOR } from "@/constant/statusConstants";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import CicleErrorIcon from "~/icons/CicleErrorIcon.svg";
import CicleTrueIcon from "~/icons/CicleTrueIcon.svg";
import Delete from "~/icons/DeleteIcon.svg";
import Edit from "~/icons/EditIcon.svg";

export type CompanyIconType =
  | "add"
  | "edit"
  | "delete"
  | "active"
  | "inactive"
  | "sendInvitation"
  | "approval"
  | "deactivate"
  | "activate";

interface TableColumnProps {
  optionIconClick: (value: CompanyVo, type: CompanyIconType) => void;
}

const useReturnTableColumn = (props: TableColumnProps) => {
  const { optionIconClick } = props;

  const { localMoment } = useGlobalTime();

  const columns: CustomColumnDef<CompanyVo>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Company Name
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Created Date
          </div>
        );
      },
      cell: ({ row }) => (
        <div>{`${localMoment(row.getValue("createdAt")).format(
          "MM/DD/YYYY"
        )}`}</div>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Status
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div
            className={cn(
              `h-[28px] min-w-fit max-w-fit px-[12px] rounded-[14px] text-[#919FB4] text-[14px] font-[390] leading-[28px] whitespace-nowrap`,
              ADMIN_USER_STATUS_COLOR[row.original.isActive ? 1 : 2]
            )}
          >
            {row.original.isActive ? "Active" : "Inactive"}
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
            <Tooltip content="Edit">
              <Edit
                className="cursor-pointer"
                width={17}
                color={"#EB1DB2"}
                onClick={() => optionIconClick(row.original, "edit")}
              ></Edit>
            </Tooltip>
            {row.original.isActive ? (
              <Tooltip content="Deactivate">
                <CicleErrorIcon
                  onClick={() => optionIconClick(row.original, "deactivate")}
                  className="cursor-pointer"
                  width={17}
                  color={"#EF4444"}
                ></CicleErrorIcon>
              </Tooltip>
            ) : (
              <Tooltip content="Activate">
                <CicleTrueIcon
                  onClick={() => optionIconClick(row.original, "activate")}
                  className="cursor-pointer"
                  width={17}
                  color={"#3FBD6B"}
                ></CicleTrueIcon>
              </Tooltip>
            )}
            <Tooltip content="Delete">
              <Delete
                className="cursor-pointer"
                width={16}
                color={"#13227A"}
                onClick={() => optionIconClick(row.original, "delete")}
              ></Delete>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const columnsLess = columns.filter((item, index) => index != 7);

  return {
    columns,
    columnsLess,
  };
};

export default useReturnTableColumn;
