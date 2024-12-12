"use client";
import { Column, Row } from "@tanstack/react-table";
import { useSetState } from "ahooks";
import { useEffect } from "react";

import { OrderByType } from "@/api/types";
import AuthProvide from "@/components/custom/Auth";
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
import OpenEyeFillIcon from "~/icons/OpenEyeFillIcon.svg";
import ResendIcon from "~/icons/ResendIcon.svg";
import SortBottomArrow from "~/icons/SortBottomArrow.svg";
import SortTopArrow from "~/icons/SortTopArrow.svg";

import AdminUserStatus from "../components/status";
import { AdminUserVo, DepartmentListVos } from "../types";
export type AdminUserIconType =
  | "view"
  | "edit"
  | "delete"
  | "active"
  | "inactive"
  | "sendInvitation"
  | "approval";
/**
 * @description: UserCommunityRef Table column props
 */
interface TableColumnProps {
  orderBy: OrderByType;
  setOrderBy: (value: OrderByType) => void;
  optionIconClick: (value: AdminUserVo, type: AdminUserIconType) => void;
}

/**
 * @description: UserCommunityRef Table column hook
 * @param props
 * @returns
 */
const useReturnTableColumn = (props: TableColumnProps) => {
  const { orderBy, setOrderBy, optionIconClick } = props;

  /**
   * @description Table columns config
   */
  const columns: CustomColumnDef<AdminUserVo>[] = [
    // select checkbox
    {
      id: "select",
      width: 50,
      header: ({ table }) => {
        const data: AdminUserVo[] = table.options.data;
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
      width: 140,
      header: ({ column }) => {
        return (
          <span
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("first_name");
              return toggleSorting__(column);
            }}
          >
            First Name
            <span className="flex flex-col gap-[3px] items-center justify-center ml-2 h-[26px] w-[26px]">
              <SortTopArrow
                color={sortField.first_name == "asc" ? "#041329" : "#919FB4"}
                opacity="1"
              />
              <SortBottomArrow
                color={sortField.first_name == "desc" ? "#041329" : "#919FB4"}
              />
            </span>
          </span>
        );
      },
      cell: ({ row }) => <div>{row.getValue("firstName")}</div>,
    },
    {
      accessorKey: "lastName",
      width: 140,
      header: ({ column }) => {
        return (
          <span
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("last_name");
              return toggleSorting__(column);
            }}
          >
            Last Name
            <span className="flex flex-col gap-[3px] items-center justify-center ml-2 h-[26px] w-[26px]">
              <SortTopArrow
                color={sortField.last_name == "asc" ? "#041329" : "#919FB4"}
                opacity="1"
              />
              <SortBottomArrow
                color={sortField.last_name == "desc" ? "#041329" : "#919FB4"}
              />
            </span>
          </span>
        );
      },
      cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <span
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("email");
              return toggleSorting__(column);
            }}
          >
            Email Address
            <span className="flex flex-col gap-[3px] items-center justify-center ml-2 h-[26px] w-[26px]">
              <SortTopArrow
                color={sortField.email == "asc" ? "#041329" : "#919FB4"}
                opacity="1"
              />
              <SortBottomArrow
                color={sortField.email == "desc" ? "#041329" : "#919FB4"}
              />
            </span>
          </span>
        );
      },
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "nationalPhone",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("nationalPhone");
              return toggleSorting__(column);
            }}
          >
            Phone Number
            <span className="flex flex-col gap-[3px] items-center justify-center ml-2 h-[26px] w-[26px]">
              <SortTopArrow
                color={sortField.nationalPhone == "asc" ? "#041329" : "#919FB4"}
                opacity="1"
              />
              <SortBottomArrow
                color={
                  sortField.nationalPhone == "desc" ? "#041329" : "#919FB4"
                }
              />
            </span>
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("nationalPhone")}</div>,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("title");
              return toggleSorting__(column);
            }}
          >
            Title
            <span className="flex flex-col gap-[3px] items-center justify-center ml-2 h-[26px] w-[26px]">
              <SortTopArrow
                color={sortField.title == "asc" ? "#041329" : "#919FB4"}
                opacity="1"
              />
              <SortBottomArrow
                color={sortField.title == "desc" ? "#041329" : "#919FB4"}
              />
            </span>
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "departmentListVos",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Department
          </div>
        );
      },
      cell: ({ row }) => {
        const departmentListVos: DepartmentListVos[] =
          row.getValue("departmentListVos");
        const displayNames = departmentListVos.map((item: any) => item.name);
        return <div>{displayNames.join(", ")}</div>;
      },
    },
    {
      accessorKey: "terminationDate",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("termination_date");
              return toggleSorting__(column);
            }}
          >
            Termination Date
            <span className="flex flex-col gap-[3px] items-center justify-center ml-2 h-[26px] w-[26px]">
              <SortTopArrow
                color={
                  sortField.termination_date == "asc" ? "#041329" : "#919FB4"
                }
                opacity="1"
              />
              <SortBottomArrow
                color={
                  sortField.termination_date == "desc" ? "#041329" : "#919FB4"
                }
              />
            </span>
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("terminationDate")}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("status");
              return toggleSorting__(column);
            }}
          >
            Status
            <span className="flex flex-col gap-[3px] items-center justify-center ml-2 h-[26px] w-[26px]">
              <SortTopArrow
                color={sortField.status == "asc" ? "#041329" : "#919FB4"}
                opacity="1"
              />
              <SortBottomArrow
                color={sortField.status == "desc" ? "#041329" : "#919FB4"}
              />
            </span>
          </div>
        );
      },
      cell: ({ row }) => (
        <AdminUserStatus status={row.getValue("status")}></AdminUserStatus>
      ),
    },
    // action's btn
    {
      id: "actions",
      header: () => <div className="text-center">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <div className="flex gap-4 justify-center">
            <AuthProvide invert permissionName="PERMISSION_MANAGEMENT_EDIT">
              <Tooltip content="View">
                <OpenEyeFillIcon
                  className="cursor-pointer mt-[2px]"
                  width={16}
                  color={"#68B7B0"}
                  onClick={() => optionIconClick(row.original, "view")}
                ></OpenEyeFillIcon>
              </Tooltip>
            </AuthProvide>
            <AuthProvide permissionName="PERMISSION_MANAGEMENT_EDIT">
              <Tooltip content="Edit">
                <Edit
                  className="cursor-pointer"
                  width={16}
                  color={"#EB1DB2"}
                  onClick={() => optionIconClick(row.original, "edit")}
                ></Edit>
              </Tooltip>
            </AuthProvide>

            {status === 0 && (
              <AuthProvide permissionName="PERMISSION_MANAGEMENT_ACTIVATE_OR_NOT">
                <Tooltip content="Activate">
                  <CicleTrueIcon
                    onClick={() => optionIconClick(row.original, "active")}
                    className="cursor-pointer"
                    width={16}
                    color={"#3FBD6B"}
                  ></CicleTrueIcon>
                </Tooltip>
              </AuthProvide>
            )}
            {status === 1 && (
              <AuthProvide permissionName="PERMISSION_MANAGEMENT_ACTIVATE_OR_NOT">
                <Tooltip content="Deactivate">
                  <CicleErrorIcon
                    onClick={() => optionIconClick(row.original, "inactive")}
                    className="cursor-pointer"
                    width={16}
                    color={"#EF4444"}
                  ></CicleErrorIcon>
                </Tooltip>
              </AuthProvide>
            )}
            {status === 2 && (
              <AuthProvide permissionName="PERMISSION_MANAGEMENT_APPROVE_OR_NOT">
                <Tooltip content="Approve/Reject Access Request">
                  <ApprovalIcon
                    onClick={() => optionIconClick(row.original, "approval")}
                    className="cursor-pointer"
                    width={16}
                    color={"#8CBB19"}
                  ></ApprovalIcon>
                </Tooltip>
              </AuthProvide>
            )}
            {status === 3 && (
              <AuthProvide
                permissionName={[
                  "PERMISSION_MANAGEMENT_EDIT",
                  "PERMISSION_MANAGEMENT_ADD",
                ]}
              >
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
              </AuthProvide>
            )}
            {status === 4 && (
              <AuthProvide
                permissionName={[
                  "PERMISSION_MANAGEMENT_EDIT",
                  "PERMISSION_MANAGEMENT_ADD",
                ]}
              >
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
              </AuthProvide>
            )}
            {status === 5 && (
              <AuthProvide
                permissionName={[
                  "PERMISSION_MANAGEMENT_EDIT",
                  "PERMISSION_MANAGEMENT_ADD",
                ]}
              >
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
              </AuthProvide>
            )}
            <AuthProvide permissionName="PERMISSION_MANAGEMENT_DELETE">
              <Tooltip content="Delete">
                <Delete
                  className="cursor-pointer"
                  width={16}
                  color={"#13227A"}
                  onClick={() => optionIconClick(row.original, "delete")}
                ></Delete>
              </Tooltip>
            </AuthProvide>
          </div>
        );
      },
    },
  ];

  const columnsLess = columns.filter((item, index) => index != 7);
  const [sortField, setSortField] = useSetState<any>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    nationalPhone: "",
    title: "",
    role_id: "",
    status: "",
    termination_date: "",
  });
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
    const orderObj: any = newOrderBy[0];
    const newObj: any = {};
    for (let oneKey in sortField) {
      if (oneKey == key) {
        newObj[key] = orderObj["order"];
      } else {
        newObj[oneKey] = "";
      }
    }
    setSortField(newObj);
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
    columnsLess,
  };
};

export default useReturnTableColumn;

const CheckboxColumn = (props: { row: Row<AdminUserVo> }) => {
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
