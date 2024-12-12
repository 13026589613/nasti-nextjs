"use client";

// import { SearchParams } from "@/api/admin/pbjJob/type";
// import { OrderByType, PaginationType } from "@/api/types";
import { CustomColumnDef } from "@/components/custom/Table";

// import SortBottomArrow from "~/icons/SortBottomArrow.svg";
// import SortTopArrow from "~/icons/SortTopArrow.svg";
import { PbjJobVo } from "../types";

export type CompanyIconType =
  | "view"
  | "edit"
  | "delete"
  | "active"
  | "inactive"
  | "sendInvitation"
  | "approval";

// interface TableColumnProps {
//   orderBy: OrderByType;
//   pagination: PaginationType;
//   searchParams?: SearchParams;
//   setOrderBy: (value: OrderByType) => void;
//   setDeleteDialogOpen: (value: boolean) => void;
//   setEditDialogOpen: (value: boolean) => void;
//   setEditItem: (value: PbjJobVo | null) => void;
//   optionIconClick: (value: PbjJobVo, type: CompanyIconType) => void;
//   getList: any;
// }

const useReturnTableColumn = () => {
  const columns: CustomColumnDef<PbjJobVo>[] = [
    {
      accessorKey: "categoryName",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Category Name{" "}
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("categoryName")}</div>,
    },
    {
      accessorKey: "categoryCode",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Category Code{" "}
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("categoryCode")}</div>,
    },
    {
      accessorKey: "code",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Job Code{" "}
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("code")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Job Name{" "}
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },

    // {
    //   id: "actions",
    //   header: () => <div className="text-center">Action</div>,
    //   enableHiding: false,
    //   cell: ({ row }) => {
    //     return (
    //       <div className="flex gap-4 justify-center">
    //         <Edit
    //           className="cursor-pointer"
    //           width={16}
    //           color={"#EB1DB2"}
    //           onClick={() => optionIconClick(row.original, "edit")}
    //         ></Edit>
    //         <Delete
    //           className="cursor-pointer"
    //           width={16}
    //           color={"#13227A"}
    //           onClick={() => optionIconClick(row.original, "delete")}
    //         ></Delete>
    //       </div>
    //     );
    //   },
    // },
  ];

  return {
    columns,
  };
};

export default useReturnTableColumn;
