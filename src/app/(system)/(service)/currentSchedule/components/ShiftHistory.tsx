import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getShiftHistoryList } from "@/api/currentSchedule";
import { GetShiftHistoryListRes } from "@/api/currentSchedule/types";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
const ShiftHistory = (props: { shiftId: string; className?: string }) => {
  const { shiftId, className } = props;

  const { UTCMoment, zoneAbbr } = useGlobalTime();

  const [data, setData] = useState<GetShiftHistoryListRes[]>([]);
  const [loading, setLoading] = useState(false);

  const getHistory = async () => {
    setLoading(true);
    try {
      const res = await getShiftHistoryList({ shiftId });
      if (res.code === 200) {
        setData(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHistory();
  }, [shiftId]);

  return (
    <div className={cn("w-full p-[10px]", className)}>
      {data.length !== 0 && (
        <div className="w-full h-10 mb-[10px] leading-10 text-[#324664] font-[450]">
          Shift History
        </div>
      )}

      <div className="w-full ">
        {loading && (
          <div className="w-full flex justify-center">
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            {/* <Skeleton className="w-full h-5 mb-2"></Skeleton>
            <Skeleton className="w-full h-5"></Skeleton> */}
          </div>
        )}
        {!loading &&
          data.map((item, index) => {
            const descriptionList = item.description.split("|||");
            return (
              <div key={item.id} className="flex gap-4 w-full">
                <div className="relative w-[10px] min-h-[48px]">
                  {index !== 0 && (
                    <div className="absolute top-0 left-[50%] translate-x-[-50%] w-[1px] h-2 bg-[rgba(0,0,0,0.3)]"></div>
                  )}

                  <div className="absolute top-[6px] z-2 w-[10px] h-[10px] bg-white rounded-[50%] border-[2px] border-[#EB1DB2]"></div>
                  {data.length > 1 && index != data.length - 1 && (
                    <div className="absolute top-4 left-[50%] translate-x-[-50%] w-[1px] h-[calc(100%-16px)] bg-[rgba(0,0,0,0.3)]"></div>
                  )}
                </div>
                <div className="w-[calc(100%-32px)]">
                  {descriptionList.map((description, index) => {
                    return (
                      <div
                        key={index}
                        className="text-[#324664] text-wrap text-[14px] font-[400] leading-[22px]"
                      >
                        {index === 0
                          ? `${UTCMoment(item.createdAt).format(
                              "MM/DD/YYYY hh:mm A"
                            )} (${zoneAbbr}) ${description}`
                          : description}
                      </div>
                    );
                  })}
                  <div className="pb-2 text-wrap text-[#919FB4] text-[14px] font-[400] leading-[22px]">
                    {item.comment}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ShiftHistory;
