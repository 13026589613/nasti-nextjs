"use client";

import { Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import useNotification from "@/hooks/useNotification";
// import useGlobalTime from "@/hooks/useGlobalTime";
import OpenEyeFillIcon from "~/icons/OpenEyeFillIcon.svg";

import { notificationsListItemVO } from "../type";
export type AdminUserIconType = "reject" | "approve" | "rejected" | "approved";

interface TableColumnProps {
  clickIcon: (data: any) => void;
}

const useReturnNotificationsColumn = ({ clickIcon }: TableColumnProps) => {
  const { readNotificationIds, readNotification } = useNotification();

  const [handleReadedIds, setHandleReadedIds] = useState<string[]>([]);

  useEffect(() => {
    if (readNotificationIds.length > 0) {
      let readedIds = [...handleReadedIds];
      readNotificationIds.forEach((id) => {
        if (!readedIds.includes(id)) readedIds = [...readedIds, id];
      });
      setHandleReadedIds(readedIds);
      readNotification([]);
    }
  }, [readNotificationIds]);

  const isReaded = (row: Row<notificationsListItemVO>) => {
    return (
      row.original.status === "UNREAD" &&
      !handleReadedIds.includes(row.original.userNotificationId)
    );
  };

  // const { zoneAbbr } = useGlobalTime();
  const columns: CustomColumnDef<notificationsListItemVO>[] = [
    {
      accessorKey: "category",
      width: "15%",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Category
          </div>
        );
      },
      cell: ({ row }) => (
        <div className={`${isReaded(row) ? "font-bold" : ""} text-[#919FB4]`}>
          {row.original.notificationTypeName}
        </div>
      ),
    },
    {
      accessorKey: "dateTime",
      width: "15%",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Notification Date Time
          </div>
        );
      },
      cell: ({ row }) => (
        <div className={`${isReaded(row) ? "font-bold" : ""} text-[#919FB4]`}>
          {row.original.createdAtUtc}
        </div>
      ),
    },
    {
      accessorKey: "content",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Notification Content
          </div>
        );
      },
      cell: ({ row }) => (
        <div className={`${isReaded(row) ? "font-bold" : ""} text-[#919FB4]`}>
          {row.original.metadata
            ? JSON.parse(row.original.metadata).content
            : ""}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      width: "10%",
      header: () => {
        return <div className="text-center">Action</div>;
      },
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex gap-4 justify-center">
            {isReaded(row) && (
              <Tooltip content="Mark as read">
                <OpenEyeFillIcon
                  className="cursor-pointer mt-1"
                  width={16}
                  color={"#68B7B0"}
                  onClick={() => {
                    const id = row.original.userNotificationId;
                    if (!handleReadedIds.includes(id))
                      setHandleReadedIds([...handleReadedIds, id]);
                    clickIcon(id);
                  }}
                ></OpenEyeFillIcon>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return { columns };
};

export default useReturnNotificationsColumn;
