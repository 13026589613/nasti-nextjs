"use client";

import { CustomColumnDef } from "@/components/custom/Table";

import { EmployeesVo } from "../type";
interface TableColumnProps {
  defaultActiveKey: string;
}
function handleSetColumn(
  row: { getValue: (arg0: string) => string },
  key: string
) {
  const value: string = row.getValue(key);
  if (!value) return false;
  let showField = value;
  const flag = value.includes("///");
  if (flag) {
    showField = value.substring(0, value.indexOf("///"));
  }
  const errorStr = value.split("///").slice(1, value.length).join(",");
  return (
    <div>
      {showField}
      {flag && (
        <span
          className="text-[var(--primary-color)]"
          style={{ marginLeft: "10px" }}
        >
          {errorStr}
        </span>
      )}
    </div>
  );
}
const useReturnTableColumn = (props: TableColumnProps) => {
  let columns: CustomColumnDef<EmployeesVo>[] = [
    {
      accessorKey: "rowNum",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Row Num
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("rowNum")}</div>,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            First Name
          </div>
        );
      },
      cell: ({ row }) => handleSetColumn(row, "firstName"),
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
      cell: ({ row }) => handleSetColumn(row, "lastName"),
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
      cell: ({ row }) => handleSetColumn(row, "email"),
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
      cell: ({ row }) => handleSetColumn(row, "nationalPhone"),
    },
    {
      accessorKey: "workRoleNames",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Roles Allowed to Work
          </div>
        );
      },
      cell: ({ row }) => handleSetColumn(row, "workRoleNames"),
    },
    // {
    //   accessorKey: "rowTips",
    //   header: ({ column }) => {
    //     return (
    //       <div className="flex items-center cursor-pointer w-full h-full">
    //         Row Tips
    //       </div>
    //     );
    //   },
    //   cell: ({ row }) => handleSetColumn(row, "rowTips"),
    // },
  ];

  return {
    columns,
  };
};
export default useReturnTableColumn;
