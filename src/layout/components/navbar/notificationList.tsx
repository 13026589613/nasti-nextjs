import { PopoverClose } from "@radix-ui/react-popover";
import { useSetState } from "ahooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  notificationsInfo,
  notificationsList,
  readNotification,
} from "@/api/notifications";
import { notificationsListItemVO } from "@/app/(system)/(service)/notifications/type";
import CustomDialog from "@/components/custom/Dialog";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalTime from "@/hooks/useGlobalTime";
import useNotification from "@/hooks/useNotification";
import useUserStore from "@/store/useUserStore";
import CloseIcon from "~/icons/CloseIcon.svg";

export default function Select() {
  const {
    setIsRefreshUnreadMessageNumber,
    readNotification: setReadNotificationIds,
  } = useNotification();
  const { communityId } = useGlobalCommunityId();
  const { userInfo } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const [listDataInfo, setListDataInfo] = useSetState<{
    loading: boolean;
    list: notificationsListItemVO[];
  }>({
    list: [],
    loading: false,
  });
  const router = useRouter();
  const { localMoment, UTCMoment } = useGlobalTime();

  const { unreadNum } = useNotification();

  const [open, setOpen] = useState(false);

  const [currentItem, setCurrentItem] = useState<notificationsListItemVO>();

  const getFormatTime = (utcTime: string): string => {
    const localTime = UTCMoment(utcTime);
    const today = localMoment().startOf("day");
    const yesterday = localMoment().startOf("day").subtract(1, "days");
    if (localTime.isSame(today, "day")) {
      // today
      return localTime.format("hh:mm A");
    } else if (localTime.isSame(yesterday, "day")) {
      // yesterday
      return `Yesterday ${localTime.format("hh:mm A")}`;
    } else {
      // other day
      return `${localTime.format("MM/DD/YYYY")} ${localTime.format("hh:mm A")}`;
    }
  };

  const getDataList = async () => {
    try {
      setListDataInfo({
        loading: true,
      });
      const params = {
        userId: userInfo.id || "",
        communityId,
        pageSize: 5,
      };
      const { data, code } = await notificationsList(params);
      if (code !== 200 || !data) return;
      const list = data.items.map((item) => {
        let data = {
          ...item,
        };
        let metadata = "";
        try {
          metadata = data.metadata;
        } catch (error) {
          metadata = "";
        } finally {
          data.metadata = metadata;
          return data;
        }
      }) as notificationsListItemVO[];

      setListDataInfo({
        list,
      });
    } finally {
      setListDataInfo({
        loading: false,
      });
    }
  };

  useEffect(() => {
    getDataList();
  }, [unreadNum]);

  const setNotificationRead = async (ids: string[]) => {
    try {
      const { code } = await readNotification(ids);
      if (code !== 200) return;
      setReadNotificationIds(ids);
    } catch (error) {}
  };

  const getNotificationsDetail = async (id: string) => {
    try {
      const { code, data } = await notificationsInfo(id);
      if (code !== 200) return;
      setCurrentItem(data);
      setOpen(true);
      setIsRefreshUnreadMessageNumber(true);
    } catch (error) {}
  };

  const clickItem = async (userNotificationId: string) => {
    getNotificationsDetail(userNotificationId);
    await setNotificationRead([userNotificationId]);
    getDataList();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="font-medium">Notifications</div>
        <PopoverClose>
          <CloseIcon
            width="12px"
            height="12px"
            color="#324664"
            className="cursor-pointer"
          />
        </PopoverClose>
      </div>
      <div className="max-h-96 overflow-y-scroll mt-3 mb-2 pr-2">
        {listDataInfo.list.length === 0 && (
          <div className="text-center text-[#919FB4]">No results.</div>
        )}
        {listDataInfo.list.length !== 0 &&
          listDataInfo.list.map((item, index) => {
            const { metadata, notificationTypeName, createdAtUtc } = item;
            let notificationStr = "";
            try {
              notificationStr = JSON.parse(metadata).content;
            } catch (error) {
              notificationStr = "";
            }
            return (
              <div
                onClick={async () => {
                  clickItem(item.userNotificationId);
                }}
                key={index}
                className="border-b py-2 cursor-pointer text-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className=" w-11/12 text-ellipsis whitespace-nowrap overflow-hidden">
                    {notificationStr}
                  </div>
                  <div>
                    {item.status === "UNREAD" && (
                      <div className="w-2 h-2 rounded bg-[#d838ae]"></div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#919FB4]">
                  <div className="text-ellipsis whitespace-nowrap overflow-hidden">
                    {notificationTypeName}
                  </div>
                  <div className="flex-shrink-0">
                    {getFormatTime(createdAtUtc)}
                  </div>
                </div>
              </div>
            );
          })}{" "}
      </div>
      <div className="flex items-center justify-center">
        {listDataInfo.list.length !== 0 && (
          <PopoverClose>
            <span
              onClick={() => {
                router.push("/notifications");
              }}
              className="text-xs cursor-pointer text-center text-[#d838ae]"
            >
              See All
            </span>
          </PopoverClose>
        )}
      </div>
      <CustomDialog
        title={"Notification Detail"}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <div className="min-h-[30vh] text-wrap break-words max-h-[75vh] overflow-y-auto">
          {currentItem?.metadata
            ? JSON.parse(currentItem.metadata).content
            : ""}
        </div>
        {/* <div className="flex gap-6 justify-end mt-5">
            <Button onClick={() => setOpen(false)} variant="outline">
              Cancel
            </Button>

            <Button onClick={handleDialogConfirm} loading={dialogConfirmLoading}>
            Go to this Record
          </Button>
          </div> */}
      </CustomDialog>
    </>
  );
}
