import { useSetState } from "ahooks";
import { useEffect, useState } from "react";

import { recipientsList } from "@/api/announcements";
import { Recipients } from "@/api/announcements/type";
import { PaginationType } from "@/api/types";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import Table, { CustomColumnDef } from "@/components/custom/Table";

interface RecipientListDiaProps {
  open: boolean;
  id: string;
  onClose: () => void;
}

const RecipientListDia = (props: RecipientListDiaProps) => {
  const { open, id, onClose } = props;
  const columns: CustomColumnDef<Recipients>[] = [
    {
      accessorKey: "Recipient",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Recipient
          </div>
        );
      },
      cell: ({ row }) => (
        <div>{row.original.firstName + " " + row.original.lastName}</div>
      ),
    },
    {
      accessorKey: "status",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            Read Status
          </div>
        );
      },
      cell: ({ row }) => {
        const { readAt } = row.original;
        if (readAt) {
          return (
            <div className="flex justify-center items-center w-[60px] h-[28px] rounded-[14px] bg-[#46DB7A1A]">
              Read
            </div>
          );
        }
        return (
          <div className="flex justify-center items-center w-[76px] h-[28px] rounded-[14px] bg-[#F55F4E1A]">
            Unread
          </div>
        );
      },
    },
  ];

  const [data, setData] = useState<Recipients[]>([]);

  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 0,
  });

  const getRecipients = async () => {
    try {
      setLoading(true);
      const res = await recipientsList(id, pagination);
      if (res.code === 200) {
        setData(res.data.records);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecipients();
  }, [pagination.pageNum, pagination.pageSize]);

  return (
    <CustomDialog
      title="Recipient List"
      open={open}
      onClose={onClose}
      footer={
        <div className="pt-[10px]">
          <Button
            className="mr-[10px]"
            onClick={() => {
              onClose();
            }}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="max-h-[75vh]">
        <Table
          adaptive={false}
          height="70vh"
          columns={columns}
          loading={loading}
          data={data}
          pagination={pagination}
          changePageNum={(pageNum) => {
            setPagination({ ...pagination, pageNum });
          }}
          changePageSize={(pageSize) => {
            const nowSize = pagination.pageSize * (pagination.pageNum - 1) + 1;

            const pageNum = Math.ceil(nowSize / pageSize);

            setPagination({ ...pagination, pageSize, pageNum: pageNum });
          }}
        ></Table>
      </div>
    </CustomDialog>
  );
};

export default RecipientListDia;
