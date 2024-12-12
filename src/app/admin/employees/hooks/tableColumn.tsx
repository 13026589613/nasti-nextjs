"use client";

import { OrderByType, PaginationType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import useTimeStore from "@/store/useTimeStore";
import ActionInviteIcon from "~/icons/ActionInviteIcon.svg";
import BlueUserIcon from "~/icons/BlueUserIcon.svg";
import Delete from "~/icons/DeleteIcon.svg";
import Edit from "~/icons/EditIcon.svg";
import WarnningIcon from "~/icons/WarnningIcon.svg";

import { EmployeesVo } from "../type";
interface TableColumnProps {
  employeeStatus: string;
  orderBy: OrderByType;
  pagination: PaginationType;
  setOrderBy: (value: OrderByType) => void;
  setDeleteDialogOpen: (value: boolean) => void;
  setDeleteItem: (value: EmployeesVo | null) => void;
  setEditDialogOpen: (value: boolean) => void;
  setEditItem: (value: EmployeesVo | null) => void;
  getList: any;
  setIsAdd: (value: boolean) => void;
  setInfoOpen: (value: boolean) => void;
  handleCallDetails: (value: any) => void;
  setIsChild: (value: boolean) => void;
  sendInvite: (value: string[]) => void;
  setIsEmployeeInfo: (value: boolean) => void;
  setIsView: (value: boolean) => void;
  setIsFocus: (value: boolean) => void;
}

const useReturnTableColumn = (props: TableColumnProps) => {
  const {
    employeeStatus,
    setEditDialogOpen,
    setIsAdd,
    handleCallDetails,
    sendInvite,
    setDeleteItem,
    setDeleteDialogOpen,
    setIsEmployeeInfo,
    setIsView,
    setIsFocus,
  } = props;

  const { zoneAbbr, localMoment } = useTimeStore();

  let columns: CustomColumnDef<EmployeesVo>[] = [
    {
      id: "select",
      width: 50,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Name
          </div>
        );
      },
      cell: ({ row }) => {
        const { firstName, lastName } = row.original;
        return (
          <div className="flex items-center cursor-pointer h-full">{`${
            firstName ? firstName + " " : ""
          }${lastName ? lastName : ""}`}</div>
        );
      },
    },

    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer h-full">
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
          <div className="flex items-center cursor-pointer h-full">
            Phone Number
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("nationalPhone")}</div>,
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
      accessorKey: "license",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            License
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("license")}</div>,
    },
    {
      accessorKey: "roles",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Role
          </div>
        );
      },
      cell: ({ row }) => {
        const listDepartment: [] = row.getValue("roles");
        return (
          <div className="flex flex-wrap gap-[5px]">
            {listDepartment && listDepartment.length > 0
              ? (listDepartment as []).map((item: any, index: number) => (
                  <div key={index}>
                    {item &&
                      item.name +
                        (listDepartment.length > 1 &&
                        index < listDepartment.length - 1
                          ? ","
                          : "")}
                  </div>
                ))
              : ""}
            {listDepartment && listDepartment.length == 0 && (
              <Tooltip content="No roles have been assigned. Click to add.">
                <WarnningIcon
                  onClick={() => {
                    const { workerId } = row.original;
                    if (employeeStatus == "Pending") {
                      setIsAdd(workerId ? false : true);
                      setEditDialogOpen(true);
                    } else {
                      setIsView(false);
                      setIsEmployeeInfo(true);
                    }
                    handleCallDetails(row.original);
                    setIsFocus(true);
                  }}
                  color="#F5894E"
                  width={16}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];
  if (employeeStatus == "Active") {
    columns.splice(6, 0, {
      accessorKey: "departments",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Department
          </div>
        );
      },
      cell: ({ row }) => {
        const listDepartment: [] = row.getValue("departments");
        return (
          <div className="flex flex-wrap gap-[5px]">
            {listDepartment && listDepartment.length > 0
              ? (listDepartment as []).map((item: any, index: number) => (
                  <div key={index}>
                    {item &&
                      item.name +
                        (listDepartment.length > 1 &&
                        index < listDepartment.length - 1
                          ? ","
                          : "")}
                  </div>
                ))
              : ""}
          </div>
        );
      },
    });
  }

  if (employeeStatus == "Inactive") {
    columns = [
      ...columns,
      {
        accessorKey: "terminationDate",
        header: ({ column }) => {
          return (
            <div className="flex items-center cursor-pointer  h-full">
              Termination Date
            </div>
          );
        },
        cell: ({ row }) => {
          const terminationDate = row.getValue("terminationDate");
          return (
            <div>
              {terminationDate
                ? `${localMoment(
                    terminationDate as string,
                    "YYYY-MM-DD"
                  ).format("MM/DD/YYYY")} (${zoneAbbr})`
                : ""}
            </div>
          );
        },
      },
    ];

    columns.splice(6, 0, {
      accessorKey: "departments",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Department
          </div>
        );
      },
      cell: ({ row }) => {
        const listDepartment: [] = row.getValue("departments");
        return (
          <div className="flex flex-wrap gap-[5px]">
            {listDepartment && listDepartment.length > 0
              ? (listDepartment as []).map((item: any, index: number) => (
                  <div key={index}>
                    {item &&
                      item.name +
                        (listDepartment.length > 1 &&
                        index < listDepartment.length - 1
                          ? ","
                          : "")}
                  </div>
                ))
              : ""}
          </div>
        );
      },
    });
  } else if (employeeStatus == "Pending") {
    columns = [
      ...columns,
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <div className="flex items-center cursor-pointer  h-full">
              Invitation Status
            </div>
          );
        },
        cell: ({ row }) => {
          return (
            <div>
              {row.getValue("status") == 3 ? (
                <span className="text-[#83CC9C]">Invitation Sent</span>
              ) : (
                <span className="text-[#F5894E]">Invitation Not Sent</span>
              )}
            </div>
          );
        },
      },
    ];
  }
  columns.push({
    id: "actions",
    header: () => <div>Action</div>,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex gap-4 ">
          <Tooltip content="Edit">
            <Edit
              className="cursor-pointer"
              width={16}
              color={"#EB1DB2"}
              onClick={() => {
                const { workerId } = row.original;
                if (employeeStatus == "Pending") {
                  setIsAdd(workerId ? false : true);
                  setEditDialogOpen(true);
                } else {
                  setIsView(false);
                  setIsEmployeeInfo(true);
                }
                setIsFocus(false);
                handleCallDetails(row.original);
              }}
            ></Edit>
          </Tooltip>

          {employeeStatus == "Pending" ? (
            <>
              {row.original.status === 3 ? (
                <Tooltip content="Resend Invite">
                  <ActionInviteIcon
                    className="cursor-pointer"
                    onClick={() => {
                      const userId: string = row.original?.userCommunityRefId;
                      sendInvite([userId]);
                    }}
                  />
                </Tooltip>
              ) : (
                <Tooltip content="Send Invite">
                  <BlueUserIcon
                    className="cursor-pointer"
                    onClick={() => {
                      const userId: string = row.original?.userCommunityRefId;
                      sendInvite([userId]);
                    }}
                  />
                </Tooltip>
              )}
            </>
          ) : (
            ""
          )}
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
        </div>
      );
    },
  });

  return {
    columns,
  };
};
export default useReturnTableColumn;
