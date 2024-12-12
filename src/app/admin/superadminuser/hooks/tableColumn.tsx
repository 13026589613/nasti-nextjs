"use client";
import { Column } from "@tanstack/react-table";
import { useSetState } from "ahooks";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import { updateUserState } from "@/api/admin/user";
import { UserParams } from "@/api/admin/user/type";
import { OrderByType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
// import AdminUserStatus from "../components/status";
import {
  SUPER_ADMIN_USER_STATUS,
  SUPER_ADMIN_USER_STATUS_COLOR,
} from "@/constant/statusConstants";
import { cn } from "@/lib/utils";
import useUserStore from "@/store/useUserStore";
import CicleErrorIcon from "~/icons/CicleErrorIcon.svg";
import CicleTrueIcon from "~/icons/CicleTrueIcon.svg";
import Delete from "~/icons/DeleteIcon.svg";
import Edit from "~/icons/EditIcon.svg";
import ResendIcon from "~/icons/ResendIcon.svg";

import { UserVo } from "../types";
export type UserIconType = "view" | "edit" | "delete" | "sendInvitation";
interface TableColumnProps {
  orderBy: OrderByType;
  setOrderBy: (value: OrderByType) => void;
  optionIconClick: (value: UserVo, type: UserIconType) => void;
  getUserListData: (params?: UserParams) => void;
}

const useReturnTableColumn = (props: TableColumnProps) => {
  const { orderBy, setOrderBy, optionIconClick, getUserListData } = props;

  const { userInfo } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const handleEnabled = async (id: string, type: string) => {
    try {
      const res = await updateUserState(id);
      if (res.code === 200 && res.data) {
        toast.success(
          type === "Active"
            ? "Activated successfully."
            : "Deactivated successfully.",
          {
            position: "top-center",
          }
        );
        getUserListData?.();
      }
    } finally {
    }
  };

  const columns: CustomColumnDef<UserVo>[] = [
    {
      accessorKey: "firstName",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("firstName");
              return toggleSorting__(column);
            }}
          >
            First Name
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("firstName")}</div>,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Last Name
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
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
              // @ts-ignore
              SUPER_ADMIN_USER_STATUS_COLOR[row.original.status]
            )}
          >
            {/* @ts-ignore */}
            {SUPER_ADMIN_USER_STATUS[row.original.status]}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const isMe = userInfo?.id === row.original.id;
        const status = row.getValue("status");
        return !isMe ? (
          <div className="flex gap-4 justify-center">
            <Tooltip content="Edit">
              <Edit
                className="cursor-pointer"
                width={17}
                height={17}
                color={"#EB1DB2"}
                onClick={() => optionIconClick(row.original, "edit")}
              ></Edit>
            </Tooltip>
            {status === 1 && (
              <Tooltip content="Deactivate">
                <CicleErrorIcon
                  onClick={() => handleEnabled(row.original.id, "Inactive")}
                  className="cursor-pointer"
                  width={17}
                  height={17}
                  color={"#EF4444"}
                ></CicleErrorIcon>
              </Tooltip>
            )}
            {status === 0 && (
              <Tooltip content="Activate">
                <CicleTrueIcon
                  onClick={() => handleEnabled(row.original.id, "Active")}
                  className="cursor-pointer"
                  width={17}
                  height={17}
                  color={"#3FBD6B"}
                ></CicleTrueIcon>
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
                  height={16}
                  color={"#1AABA8"}
                ></ResendIcon>
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
        ) : (
          <></>
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

// export const CheckboxColumn = (props: { row: Row<UserVo> }) => {
//   const { row } = props;
//   const value = !CAN_SEND_EMAIL_STATUS.includes(row.original.status)
//     ? false
//     : row.getIsSelected();
//   useEffect(() => {
//     if (!CAN_SEND_EMAIL_STATUS.includes(row.original.status)) {
//       row.toggleSelected(false);
//     }
//   }, [row.getIsSelected()]);
//   return (
//     <Checkbox
//       disabled={!CAN_SEND_EMAIL_STATUS.includes(row.original.status)}
//       checked={value}
//       onCheckedChange={(value) => {
//         if (!CAN_SEND_EMAIL_STATUS.includes(row.original.status)) {
//           row.toggleSelected(false);
//         } else {
//           row.toggleSelected(!!value);
//         }
//       }}
//       aria-label="Select row"
//     />
//   );
// };
