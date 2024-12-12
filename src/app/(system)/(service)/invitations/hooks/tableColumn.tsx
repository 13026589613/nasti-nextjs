"use client";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import { InviteConfirmApi } from "@/api/auth";
import { InviteVo } from "@/api/invitations/type";
import CustomButton from "@/components/custom/Button";
import { CustomColumnDef } from "@/components/custom/Table";
import useGlobalTime from "@/hooks/useGlobalTime";
import useMenuNumStore from "@/store/useMenuNumStore";
interface TableColumnProps {
  getList: () => void;
}
const useReturnTableColumn = (props: TableColumnProps) => {
  const { getList } = props;

  const { UTCMoment } = useGlobalTime();

  const { setIsRefreshInvitationPending } = useMenuNumStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const onJion = async (id: string) => {
    try {
      const res = await InviteConfirmApi(id);
      if (res.code === 200 && res.data) {
        toast.success("You have joined the community successfully.", {
          position: "top-center",
        });
        getList?.();
        setIsRefreshInvitationPending(true);
      }
    } finally {
    }
  };

  const columns: CustomColumnDef<InviteVo>[] = [
    {
      accessorKey: "communityName",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Community{" "}
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("communityName")}</div>,
    },
    {
      accessorKey: "userName",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Invited By{" "}
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("userName")}</div>,
    },
    {
      accessorKey: "createdAt",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Date Invited{" "}
          </div>
        );
      },
      cell: ({ row }) => (
        <div>
          {UTCMoment(row.getValue("createdAt")).format("MM/DD/YYYY hh:mm A")}
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
        let roleCode = row.original.roleCode;
        return (
          <div className="flex gap-4 justify-center">
            <CustomButton
              className="w-[120px]"
              variant="default"
              type="button"
              onClick={() => {
                onJion(row.original.id);
              }}
            >
              {`Join as ${
                roleCode.charAt(0).toUpperCase() +
                roleCode.slice(1).toLowerCase()
              }`}
            </CustomButton>
          </div>
        );
      },
    },
  ];

  return {
    columns,
  };
};

export default useReturnTableColumn;
