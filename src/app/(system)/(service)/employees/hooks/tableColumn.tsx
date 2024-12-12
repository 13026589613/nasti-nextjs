"use client";

import { useSetState } from "ahooks";
import { useShallow } from "zustand/react/shallow";

import { OrderByType, PaginationType } from "@/api/types";
import AuthProvide from "@/components/custom/Auth";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import useAuthStore from "@/store/useAuthStore";
import useTimeStore from "@/store/useTimeStore";
import ActionInviteIcon from "~/icons/ActionInviteIcon.svg";
import BlueUserIcon from "~/icons/BlueUserIcon.svg";
import CheckIcon from "~/icons/CheckIcon.svg";
import Delete from "~/icons/DeleteIcon.svg";
import Edit from "~/icons/EditIcon.svg";
import SortBottomArrow from "~/icons/SortBottomArrow.svg";
import SortTopArrow from "~/icons/SortTopArrow.svg";
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
    orderBy,
    setOrderBy,
    setEditDialogOpen,
    setIsAdd,
    setInfoOpen,
    handleCallDetails,
    sendInvite,
    setDeleteItem,
    setDeleteDialogOpen,
    setIsEmployeeInfo,
    setIsView,
    setIsFocus,
  } = props;

  const { zoneAbbr, localMoment } = useTimeStore();

  const { permission } = useAuthStore(
    useShallow((state: any) => ({
      ...state,
    }))
  );
  const [sortField, setSortField] = useSetState<any>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    nationalPhone: "",
    license: "",
    status: "",
    termination_date: "",
  });
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
      accessorKey: "firstName",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer h-full"
            onClick={() => {
              changeOrderBy("first_name");
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
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("firstName")}</div>,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer  h-full"
            onClick={() => {
              changeOrderBy("last_name");
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
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer h-full"
            onClick={() => {
              changeOrderBy("email");
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
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "nationalPhone",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer h-full"
            onClick={() => {
              changeOrderBy("nationalPhone");
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
      accessorKey: "license",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer w-full h-full"
            onClick={() => {
              changeOrderBy("license");
            }}
          >
            License
            <span className="flex flex-col gap-[3px] items-center justify-center ml-2 h-[26px] w-[26px]">
              <SortTopArrow
                color={sortField.license == "asc" ? "#041329" : "#919FB4"}
                opacity="1"
              />
              <SortBottomArrow
                color={sortField.license == "desc" ? "#041329" : "#919FB4"}
              />
            </span>
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
            <div
              className="flex items-center cursor-pointer  h-full"
              onClick={() => {
                changeOrderBy("termination_date");
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
            <div
              className="flex items-center cursor-pointer  h-full"
              onClick={() => {
                changeOrderBy("status");
              }}
            >
              Invitation Status
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
          {permission.includes("EMPLOYEE_MANAGEMENT_EDIT") ? (
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
          ) : (
            <Tooltip content="View">
              <CheckIcon
                className="cursor-pointer"
                width={16}
                color={"#68B7B0"}
                onClick={() => {
                  const { workerId } = row.original;
                  if (employeeStatus == "Pending") {
                    setIsAdd(workerId ? false : true);
                    setInfoOpen(true);
                  } else {
                    setIsView(true);
                    setIsEmployeeInfo(true);
                  }
                  setIsFocus(false);
                  handleCallDetails(row.original);
                }}
              ></CheckIcon>
            </Tooltip>
          )}

          {employeeStatus == "Pending" ? (
            <>
              {row.original.status === 3 ? (
                <>
                  {permission.includes("EMPLOYEE_MANAGEMENT_ADD") ||
                  permission.includes("EMPLOYEE_MANAGEMENT_EDIT") ? (
                    <Tooltip content="Resend Invite">
                      <ActionInviteIcon
                        className="cursor-pointer"
                        onClick={() => {
                          const userId: string = row.original?.userId;
                          sendInvite([userId]);
                        }}
                      />
                    </Tooltip>
                  ) : (
                    ""
                  )}
                </>
              ) : (
                <>
                  {permission.includes("EMPLOYEE_MANAGEMENT_ADD") ||
                  permission.includes("EMPLOYEE_MANAGEMENT_EDIT") ? (
                    <Tooltip content="Send Invite">
                      <BlueUserIcon
                        className="cursor-pointer"
                        onClick={() => {
                          const userId: string = row.original?.userId;
                          sendInvite([userId]);
                        }}
                      />
                    </Tooltip>
                  ) : (
                    ""
                  )}
                </>
              )}
            </>
          ) : (
            ""
          )}
          <AuthProvide permissionName="EMPLOYEE_MANAGEMENT_DELETE">
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
          </AuthProvide>
        </div>
      );
    },
  });

  return {
    columns,
  };
};
export default useReturnTableColumn;
