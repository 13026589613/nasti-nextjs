"use client";

import { CommunityVo } from "@/api/admin/community/type";
import { OrderByType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { ADMIN_USER_STATUS_COLOR } from "@/constant/statusConstants";
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
  | "deactivate";
/**
 * @description: UserCommunityRef Table column props
 */
interface TableColumnProps {
  orderBy: OrderByType;
  setOrderBy: (value: OrderByType) => void;
  optionIconClick: (value: CommunityVo, type: CompanyIconType) => void;
  getCommunityListData: () => void;
}

/**
 * @description: UserCommunityRef Table column hook
 * @param props
 * @returns
 */
const useReturnTableColumn = (props: TableColumnProps) => {
  const { optionIconClick } = props;

  /**
   * @description Table columns config
   */
  const columns: CustomColumnDef<CommunityVo>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Community Name
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "companyName",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Company Name
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("companyName")}</div>,
    },

    {
      accessorKey: "physicalAddress",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Address
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("physicalAddress")}</div>,
    },
    {
      accessorKey: "physicalCity",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            City
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("physicalCity")}</div>,
    },
    {
      accessorKey: "physicalStateName",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            State
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("physicalStateName")}</div>,
    },
    {
      width: 80,
      accessorKey: "physicalZip",
      header: ({ column }) => {
        return <div className="flex items-center cursor-pointer">Zip</div>;
      },
      cell: ({ row }) => <div>{row.getValue("physicalZip")}</div>,
    },
    {
      accessorKey: "buildingTypeList",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Building Type
          </div>
        );
      },
      cell: ({ row }) => (
        <div>
          {row.original.buildingTypeList?.map((item) => item).join(", ")}
        </div>
      ),
    },
    {
      accessorKey: "billingEmail",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Billing Contact Email
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("billingEmail")}</div>,
    },
    {
      accessorKey: "billingContact",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Billing Contact Name
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("billingContact")}</div>,
    },
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
          <div
            className={cn(
              `h-[28px] min-w-fit max-w-fit px-[12px] rounded-[14px] text-[#919FB4] text-[14px] font-[390] leading-[28px] whitespace-nowrap`,
              ADMIN_USER_STATUS_COLOR[row.original.isEnabled ? 1 : 0]
            )}
          >
            {row.original.isEnabled ? "Active" : "Inactive"}
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
                width={16}
                color={"#EB1DB2"}
                onClick={() => optionIconClick(row.original, "edit")}
              ></Edit>
            </Tooltip>
            {!row.original.isEnabled ? (
              <Tooltip content="Activate">
                <CicleTrueIcon
                  onClick={() => optionIconClick(row.original, "active")}
                  className="cursor-pointer"
                  width={16}
                  height={17}
                  color={"#3FBD6B"}
                ></CicleTrueIcon>
              </Tooltip>
            ) : (
              <Tooltip content="Deactivate">
                <CicleErrorIcon
                  onClick={() => optionIconClick(row.original, "deactivate")}
                  className="cursor-pointer"
                  width={16}
                  height={17}
                  color={"#EF4444"}
                ></CicleErrorIcon>
              </Tooltip>
            )}
            <Tooltip content="Delete">
              <Delete
                className="cursor-pointer"
                width={17}
                height={17}
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
