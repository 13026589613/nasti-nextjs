"use client";
import { Row } from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";

import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import useAuthStore from "@/store/useAuthStore";
import OpenEyeFillIcon from "~/icons/OpenEyeFillIcon.svg";
// import MessageIcon from "~/images/MessageIcon.svg";
import ReviewIcon from "~/images/ReviewIcon.svg";

import NeedHelpShiftStatus from "../components/NeedHelpShiftStatus";
import { NeedHelpShift } from "../types";
import { isCanNotCheck } from "../utils";
export type AdminUserIconType = "reject" | "approve" | "rejected" | "approved";
/**
 * @description: UserCommunityRef Table column props
 */
interface TableColumnProps {
  selectedRows: string[];
  setSelectedRows: (value: string[]) => void;
  clickIcon: (icon: string, data: NeedHelpShift) => void;
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
  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const handleAllCheck = (value: boolean, data: NeedHelpShift[]) => {
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
      let resData = data
        .filter((item) => {
          for (let index = 0; index < selectedRows.length; index++) {
            const element = selectedRows[index];
            if (element === item.id) {
              return false;
            }
          }
          return true;
        })
        .filter((item) => !isCanNotCheck(item.status));
      const res = resData.map((item) => item.id);
      setSelectedRows(res);
    }
  };

  const handleCheck = (value: boolean, id: string) => {
    let res = [];
    if (!value) {
      res = [...selectedRows.filter((item) => item !== id)];
    } else {
      res = [...selectedRows, id];
    }
    setSelectedRows(res);
  };

  const columns: CustomColumnDef<NeedHelpShift>[] = [
    {
      id: "select",
      accessorKey: "select",
      width: 50,
      header: ({ table }) => {
        const data: NeedHelpShift[] = table.options.data.filter(
          (item) => !isCanNotCheck(item.status)
        );
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
      accessorKey: "departmentName",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Department
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("departmentName")}</div>,
    },
    {
      accessorKey: "scheduleWeek",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Schedule Week
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("scheduleWeek")}</div>,
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
      cell: ({ row }) => <div>{row.getValue("roleName")}</div>,
    },
    {
      accessorKey: "employee",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Employee
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("employee")}</div>,
    },
    {
      accessorKey: "proposer",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Proposer
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("proposer")}</div>,
    },
    {
      accessorKey: "proposee",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Accepted by
          </div>
        );
      },
      cell: ({ row }) => {
        const list: string[] | null = row.getValue("proposee");
        return (
          <div>
            {list?.map((record: string, key: number) => (
              <div className="leading-10" key={key}>
                {record}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "partialShift",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Partial Shift
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("partialShift")}</div>,
    },
    {
      accessorKey: "shiftDate",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Shift Date Time
          </div>
        );
      },
      cell: ({ row }) => {
        const { shiftEndTime, shiftStartTime } = row.original;
        return <div>{`${shiftStartTime} - ${shiftEndTime}`}</div>;
      },
    },
    {
      accessorKey: "claimedBy",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Claimed by
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("claimedBy")}</div>,
    },
    {
      accessorKey: "status",
      width: "12%",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Status
          </div>
        );
      },
      cell: ({ row }) => (
        <NeedHelpShiftStatus
          status={row.getValue("status")}
        ></NeedHelpShiftStatus>
      ),
    },
  ];

  const column_option: (type: string) => CustomColumnDef<NeedHelpShift> = (
    type: string
  ) => {
    return {
      accessorKey: "actions",
      header: () => <div className="text-center">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const { status } = row.original;
        const pendingStatus = [
          "PENDING",
          "NEW",
          "PENDING_APPROVAL",
          "REQUESTED",
        ];
        const isPending = pendingStatus.includes(status);

        let isShowReview = false;

        if (type === "swap") {
          isShowReview =
            permission.includes("SCHEDULE_MANAGEMENT_APPROVE_SWAP") &&
            isPending;
        } else if (type === "crabs") {
          isShowReview =
            permission.includes("SCHEDULE_MANAGEMENT_APPROVE_UFG") && isPending;
        } else if (type === "call") {
          isShowReview =
            permission.includes("SCHEDULE_MANAGEMENT_APPROVE_CALL_OFF") &&
            isPending;
        } else if (type === "claims") {
          isShowReview =
            permission.includes("SCHEDULE_MANAGEMENT_APPROVE_CLAIMED_SHIFT") &&
            isPending;
        } else if (type === "overtime") {
          isShowReview =
            permission.includes("SCHEDULE_MANAGEMENT_APPROVE_OVERTIME") &&
            isPending;
        }

        return (
          <div className="flex gap-4 justify-center">
            {isShowReview && (
              <Tooltip content="Review">
                <ReviewIcon
                  className="cursor-pointer mt-1"
                  width={16}
                  color={"#68B7B0"}
                  onClick={() => {
                    clickIcon("review", row.original);
                  }}
                ></ReviewIcon>
              </Tooltip>
            )}
            {!isShowReview && (
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
            )}
          </div>
        );
      },
    };
  };

  const columns_swap_key = [
    "departmentName",
    "roleName",
    "proposer",
    "proposee",
    "status",
  ];

  const columns_crabs_key = [
    "departmentName",
    "roleName",
    "proposer",
    "partialShift",
    "status",
  ];

  const columns_call_key = ["departmentName", "roleName", "proposer", "status"];

  const columns_claims_key = [
    "departmentName",
    "roleName",
    "shiftDate",
    "claimedBy",
    "status",
  ];

  const columns_overtime_key = [
    "select",
    "departmentName",
    "scheduleWeek",
    "roleName",
    "employee",
    "shiftDate",
    "status",
  ];

  const columns_swap: CustomColumnDef<NeedHelpShift>[] = [
    ...columns.filter((item: any) => {
      return columns_swap_key.includes(item?.accessorKey);
    }),
    column_option("swap"),
  ];

  const columns_crabs: CustomColumnDef<NeedHelpShift>[] = [
    ...columns.filter((item: any) => {
      return columns_crabs_key.includes(item?.accessorKey);
    }),
    column_option("crabs"),
  ];

  const columns_call: CustomColumnDef<NeedHelpShift>[] = [
    ...columns.filter((item: any) => {
      return columns_call_key.includes(item?.accessorKey);
    }),
    column_option("call"),
  ];

  const columns_claims: CustomColumnDef<NeedHelpShift>[] = [
    ...columns.filter((item: any) => {
      return columns_claims_key.includes(item?.accessorKey);
    }),
    column_option("claims"),
  ];

  const columns_overtime: CustomColumnDef<NeedHelpShift>[] = [
    ...columns.filter((item: any) => {
      return columns_overtime_key.includes(item?.accessorKey);
    }),
    column_option("overtime"),
  ];

  return {
    columns_swap,
    columns_crabs,
    columns_call,
    columns_claims,
    columns_overtime,
  };
};

export default useReturnTimeOffTableColumn;

const CheckboxColumn = (props: {
  row: Row<NeedHelpShift>;
  onChange: (value: boolean, id: string) => void;
}) => {
  const { row, onChange } = props;
  // useEffect(() => {
  //   row.toggleSelected(false);
  // }, [row.getIsSelected()]);
  return (
    <Checkbox
      disabled={isCanNotCheck(row.original.status)}
      checked={row.getIsSelected()}
      onCheckedChange={(value) => {
        onChange(value as boolean, row.original.id);
        row.toggleSelected(!!value);
      }}
      aria-label="Select row"
    />
  );
};
