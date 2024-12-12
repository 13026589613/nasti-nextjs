"use client";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import useGlobalTime from "@/hooks/useGlobalTime";
import OpenEyeFillIcon from "~/icons/OpenEyeFillIcon.svg";
export type AdminUserIconType = "reject" | "approve" | "rejected" | "approved";
import Delete from "~/icons/DeleteIcon.svg";
interface TableColumnProps {
  isHasAnnouncementDeletePermission: boolean;
  clickDelete: (data: any) => void;
  clickView: (data: any) => void;
}

const useReturnAnnouncementsColumn = ({
  isHasAnnouncementDeletePermission,
  clickDelete,
  clickView,
}: TableColumnProps) => {
  const { UTCMoment } = useGlobalTime();
  const columns: CustomColumnDef<any>[] = [
    {
      accessorKey: "department",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Department
          </div>
        );
      },
      cell: ({ row }) => <div>{row.original.departmentNames}</div>,
    },
    {
      accessorKey: "content",
      width: "40%",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Content
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="max-w-[45vw] text-wrap break-words">
          {row.original.content}
        </div>
      ),
    },
    {
      accessorKey: "published date",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Published Date
          </div>
        );
      },
      cell: ({ row }) => <div>{row.original.createdAt}</div>,
    },
    {
      accessorKey: "expiration date",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Expiration Date
          </div>
        );
      },
      cell: ({ row }) => (
        <div>
          {UTCMoment(row.original.expirationDateTime).format("MM/DD/YYYY")}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: () => {
        return (
          <div className="flex items-center justify-center cursor-pointer w-full h-full">
            Action
          </div>
        );
      },
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex gap-4 justify-center">
            <Tooltip content="View">
              <OpenEyeFillIcon
                className="cursor-pointer mt-1"
                width={16}
                color={"#68B7B0"}
                onClick={() => {
                  clickView(row.original.id);
                }}
              ></OpenEyeFillIcon>
            </Tooltip>
            {isHasAnnouncementDeletePermission && (
              <Tooltip content="Delete">
                <Delete
                  className="cursor-pointer mt-1"
                  width={16}
                  color={"#13227A"}
                  onClick={() => {
                    clickDelete(row.original.id);
                  }}
                ></Delete>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return { columns };
};

export default useReturnAnnouncementsColumn;
