"use client";
import { Row } from "@tanstack/react-table";

import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { CAN_SEND_EMAIL_STATUS } from "@/constant/statusConstants";
import ApprovalIcon from "~/icons/ApprovalIcon.svg";
import CicleErrorIcon from "~/icons/CicleErrorIcon.svg";
import CicleTrueIcon from "~/icons/CicleTrueIcon.svg";
import Delete from "~/icons/DeleteIcon.svg";
import Edit from "~/icons/EditIcon.svg";
import InvitationUserIcon from "~/icons/InvitationUserIcon.svg";
import ResendIcon from "~/icons/ResendIcon.svg";

import AdminUserStatus from "../components/status";
export type AdminUserIconType =
  | "view"
  | "edit"
  | "delete"
  | "active"
  | "inactive"
  | "sendInvitation"
  | "approval";
import { useEffect } from "react";

import { RecordVo } from "@/api/admin/adminuser/type";
/**
 * @description: UserCommunityRef Table column props
 */
interface TableColumnProps {
  optionIconClick: (value: RecordVo, type: AdminUserIconType) => void;
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
  const columns: CustomColumnDef<RecordVo>[] = [
    // select checkbox
    {
      id: "select",
      width: 50,
      header: ({ table }) => {
        const data: RecordVo[] = table.options.data;
        const selectLength = table.getSelectedRowModel().rows;
        let disabledLength = 0;
        data.forEach((item) => {
          if (!CAN_SEND_EMAIL_STATUS.includes(item.status)) {
            disabledLength++;
          }
        });
        const isAllSelected =
          selectLength.length === data.length - disabledLength;
        let checked: boolean | "indeterminate" = false;

        if (selectLength.length === 0) {
          checked = false;
        } else {
          checked = isAllSelected ? true : "indeterminate";
        }
        return (
          <>
            {data.length - disabledLength !== 0 ? (
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => {
                  table.toggleAllPageRowsSelected(!!value);
                }}
                aria-label="Select all"
              />
            ) : (
              ""
            )}
          </>
        );
      },
      cell: ({ row }) => <CheckboxColumn row={row}></CheckboxColumn>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Name
          </div>
        );
      },
      cell: ({ row }) => {
        const { firstName, lastName } = row.original;
        const name = `${firstName ? firstName + " " : ""}${lastName}`;
        return <div>{name}</div>;
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Email Address
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "nationalPhone",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Phone Number
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("nationalPhone")}</div>,
    },
    {
      accessorKey: "communityName",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Community Name
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("communityName")}</div>,
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
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Title
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "terminationDate",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Termination Date
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("terminationDate")}</div>,
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
      cell: ({ row }) => (
        <AdminUserStatus status={row.getValue("status")}></AdminUserStatus>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const status = row.getValue("status");
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

            {status === 0 && (
              <Tooltip content="Activate">
                <CicleTrueIcon
                  onClick={() => optionIconClick(row.original, "active")}
                  className="cursor-pointer"
                  width={16}
                  color={"#3FBD6B"}
                ></CicleTrueIcon>
              </Tooltip>
            )}
            {status === 1 && (
              <Tooltip content="Deactivate">
                <CicleErrorIcon
                  onClick={() => optionIconClick(row.original, "inactive")}
                  className="cursor-pointer"
                  width={16}
                  color={"#EF4444"}
                ></CicleErrorIcon>
              </Tooltip>
            )}
            {status === 2 && (
              <Tooltip content="Approve/Reject Access Request">
                <ApprovalIcon
                  onClick={() => optionIconClick(row.original, "approval")}
                  className="cursor-pointer"
                  width={16}
                  color={"#8CBB19"}
                ></ApprovalIcon>
              </Tooltip>
            )}
            {status === 3 && (
              <Tooltip content="Resend Invite">
                <ResendIcon
                  onClick={() =>
                    optionIconClick(row.original, "sendInvitation")
                  }
                  className="cursor-pointer"
                  width={16}
                  color={"#1AABA8"}
                ></ResendIcon>
              </Tooltip>
            )}
            {status === 4 && (
              <Tooltip content="Send Invite">
                <InvitationUserIcon
                  onClick={() =>
                    optionIconClick(row.original, "sendInvitation")
                  }
                  className="cursor-pointer"
                  width={20}
                  color={"#29D6D6"}
                ></InvitationUserIcon>
              </Tooltip>
            )}
            {status === 5 && (
              <Tooltip content="Resend Invite">
                <ResendIcon
                  onClick={() =>
                    optionIconClick(row.original, "sendInvitation")
                  }
                  className="cursor-pointer"
                  width={16}
                  color={"#EF4444"}
                ></ResendIcon>
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
  //
  return {
    columns,
    columnsLess,
  };
};

export default useReturnTableColumn;
const CheckboxColumn = (props: { row: Row<RecordVo> }) => {
  const { row } = props;
  const value = !CAN_SEND_EMAIL_STATUS.includes(row.original.status)
    ? false
    : row.getIsSelected();
  useEffect(() => {
    if (!CAN_SEND_EMAIL_STATUS.includes(row.original.status)) {
      row.toggleSelected(false);
    }
  }, [row.getIsSelected()]);
  return (
    <Checkbox
      disabled={!CAN_SEND_EMAIL_STATUS.includes(row.original.status)}
      checked={value}
      onCheckedChange={(value) => {
        if (!CAN_SEND_EMAIL_STATUS.includes(row.original.status)) {
          row.toggleSelected(false);
        } else {
          row.toggleSelected(!!value);
        }
      }}
      aria-label="Select row"
    />
  );
};
