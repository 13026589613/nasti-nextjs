"use client";

import { CustomColumnDef } from "@/components/custom/Table";

import { TimeOffVo } from "../types";

const useReturnTimeOffTableColumn = () => {
  const columns: CustomColumnDef<TimeOffVo>[] = [
    {
      accessorKey: "userName",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Name
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("userName")}</div>,
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Date/Time
          </div>
        );
      },
      cell: ({ row }) => (
        <div>
          {row.getValue("startDate") +
            " " +
            row.getValue("startTime") +
            " - " +
            row.getValue("endDate") +
            " " +
            row.getValue("endTime")}
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Reason
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("reason")}</div>,
    },
  ];

  return {
    columns,
  };
};

export default useReturnTimeOffTableColumn;
