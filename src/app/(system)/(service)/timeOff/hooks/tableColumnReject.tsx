"use client";

import { CustomColumnDef } from "@/components/custom/Table";
import useGlobalTime from "@/hooks/useGlobalTime";

import { TimeOffVo } from "../types";

const useReturnTimeOffTableColumn = () => {
  const { UTCMoment, zoneAbbr } = useGlobalTime();
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
      cell: ({ row }) => {
        const { startTimeUtc, endTimeUtc } = row.original;
        const start = startTimeUtc
          ? `${UTCMoment(startTimeUtc).format(
              "MM/DD/YYYY hh:mm A"
            )} (${zoneAbbr})`
          : "";

        const end = endTimeUtc
          ? `${UTCMoment(endTimeUtc).format(
              "MM/DD/YYYY hh:mm A"
            )} (${zoneAbbr})`
          : "";

        return <div>{start + " - " + end}</div>;
      },
    },
    {
      accessorKey: "reason",
      width: "50%",
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
