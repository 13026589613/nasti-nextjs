"use client";
import { CustomColumnDef } from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import Delete from "~/icons/DeleteIcon.svg";
import Edit from "~/icons/EditIcon.svg";

interface TableColumnProps {
  disableDelete?: boolean;
  isHasApproveAttendancePermission?: boolean;
  handleDelete?: (id: string) => void;
  handleEdit?: (rowData: any) => void;
}

const useReturnTableColumn = (props: TableColumnProps) => {
  const {
    disableDelete,
    isHasApproveAttendancePermission,
    handleDelete,
    handleEdit,
  } = props;
  const columns: CustomColumnDef<any>[] = [
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Break Type
          </div>
        );
      },
      cell: ({ row }) => <div className="">{row.original.breakType}</div>,
    },
    {
      accessorKey: "time",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Break Time (mins)
          </div>
        );
      },
      cell: ({ row }) => <div className="">{row.original.durationMins}</div>,
    },
  ];
  if (!!isHasApproveAttendancePermission && handleDelete && handleEdit) {
    // if (isCanEditBreakTime !== false && handleDelete && handleEdit) {
    columns.push({
      id: "actions",
      header: () => <div className="text-center">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex gap-4 justify-center">
            <Tooltip content="Edit">
              <Edit
                className="cursor-pointer"
                width={16}
                color={"#EB1DB2"}
                onClick={() => handleEdit(row.original)}
              ></Edit>
            </Tooltip>
            {!disableDelete && (
              <Tooltip content="Delete">
                <Delete
                  width={16}
                  color={"#D81E06"}
                  onClick={() => {
                    handleDelete(row.original.id);
                  }}
                ></Delete>
              </Tooltip>
            )}
          </div>
        );
      },
    });
  }
  //
  return {
    columns,
  };
};

export default useReturnTableColumn;
