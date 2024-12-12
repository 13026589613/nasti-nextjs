import { useEffect, useState } from "react";

import { infoData } from "@/api/announcements";
import { AnnouncementInfoData } from "@/api/announcements/type";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import Spin from "@/components/custom/Spin";
import useGlobalTime from "@/hooks/useGlobalTime";

import RecipientListDia from "./recipientListDia";

interface AnnouncementDetailProps {
  announcementInfo: {
    open: boolean;
    id: string;
  };
  onClose: () => void;
}

const AnnouncementDetail = (props: AnnouncementDetailProps) => {
  const { announcementInfo, onClose } = props;

  const { UTCMoment } = useGlobalTime();

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<AnnouncementInfoData | null | undefined>(
    null
  );

  const getInfo = async () => {
    try {
      setLoading(true);
      const { data, code } = await infoData(announcementInfo.id);
      if (code !== 200) return;
      setData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInfo();
  }, []);

  return (
    <CustomDialog
      title="View Announcement"
      open={announcementInfo.open}
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
      <Spin className="min-h-[40vh]" loading={loading}>
        {!loading && (
          <div className="min-h-[40vh] max-h-[75vh] overflow-y-auto">
            <div className="text-[16px] leading-10">Recipient</div>
            <div className="mb-[10px]">
              {data?.departmentNames && (
                <div className="text-[16px] font-[390] text-[#919FB4] leading-10">
                  {data.departmentNames}
                </div>
              )}
            </div>
            <div className="mb-[10px]">
              {data?.roleNames && (
                <div className="text-[16px] font-[390] text-[#919FB4] leading-10">
                  {data.roleNames}
                </div>
              )}
            </div>
            <div className="mb-[10px]">
              {data?.permissionNames && (
                <div className="text-[16px] font-[390] text-[#919FB4] leading-10">
                  {data.permissionNames}
                </div>
              )}
            </div>
            <div
              onClick={() => {
                setOpen(true);
              }}
              className="text-[#EB1DB2] text-[16px] font-[390] cursor-pointer mb-[10px]"
            >{`Recipient List >`}</div>
            <div className="text-[16px] leading-10">Expiration Date </div>
            <div className="text-[16px] font-[390] text-[#919FB4] leading-10 mb-[10px]">
              {data?.expirationDateTime
                ? UTCMoment(data.expirationDateTime).format("MM/DD/YYYY")
                : ""}
            </div>
            <div className="text-[16px] leading-10">Content</div>
            <div className="text-[16px] font-[390] text-[#919FB4] leading-10 mb-[10px]">
              {data?.content}
            </div>
          </div>
        )}
      </Spin>
      {open && (
        <RecipientListDia
          open={open}
          id={announcementInfo.id}
          onClose={() => {
            setOpen(false);
          }}
        ></RecipientListDia>
      )}
    </CustomDialog>
  );
};

export default AnnouncementDetail;
