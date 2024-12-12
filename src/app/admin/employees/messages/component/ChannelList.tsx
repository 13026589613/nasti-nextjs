"use client";

import React from "react";
import { useShallow } from "zustand/react/shallow";

import CustomInput from "@/components/custom/Input";
import NumberCircle from "@/components/custom/NumberCircle/numberCircleRelative";
import Spin from "@/components/custom/Spin";
import useGlobalTime from "@/hooks/useGlobalTime";
import useUserInfo from "@/hooks/useUserInfo";
import { cn } from "@/lib/utils";
import useChatMessageStore from "@/store/useChatMessageStore";
import AddFillIcon from "~/icons/AddFillIcon.svg";

import { ChannelListResponse } from "../type";
import ChannelAvatar from "./ChannelAvatar";
interface ChannelListProps {
  currentChannel: ChannelListResponse | null;
  channelList: ChannelListResponse[];
  loading: boolean;
  searchValue: string;
  setSelectUserDia: (data: boolean) => void;
  setSearchValue: (data: string) => void;
  setCurrentChannel: (data: ChannelListResponse | null) => void;
}

const ChannelList = (props: ChannelListProps) => {
  const {
    currentChannel,
    channelList,
    loading,
    searchValue,
    setSelectUserDia,
    setSearchValue,
    setCurrentChannel,
  } = props;

  const { userId } = useUserInfo();

  const { localMoment, UTCMoment } = useGlobalTime();

  const { setIsRefreshUnRead } = useChatMessageStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const searchValueChange = (e: any) => {
    setSearchValue(e.target.value);
  };

  const setLocalDateTime = (utcDateString: string): string => {
    const date = UTCMoment(utcDateString);
    const today = localMoment();
    const isYesterday = date.isSame(today.clone().subtract(1, "day"), "day");

    const isToday = date.isSame(today, "day");

    if (isYesterday) {
      return "Yesterday " + date.format("hh:mm A");
    }

    if (isToday) {
      return date.format("hh:mm A");
    }

    return date.format("MM/DD/YYYY hh:mm A");
  };

  const setUserList = (item: any) => {
    return item.userList
      .filter((inner: any) => {
        if (item.userList.length === 2) {
          return inner.userId !== userId;
        } else {
          return true;
        }
      })
      .map((user: any) => user.firstName + " " + user.lastName)
      .sort((a: any, b: any) => {
        if (a.firstName < b.firstName) return -1;
        if (a.firstName > b.firstName) return 1;
        return 0;
      })
      .join(", ");
  };

  return (
    <Spin className="w-full h-full" loading={loading}>
      <div className="w-full h-full">
        <div className="flex items-center gap-[22px] h-10 mb-[35px]">
          <div className="flex-1">
            <CustomInput
              isClearable
              value={searchValue}
              onChange={searchValueChange}
              suffix="SearchIcon2"
              placeholder="Name/Message"
            ></CustomInput>
          </div>
          <AddFillIcon
            color="#EB1DB2"
            onClick={() => {
              setSelectUserDia(true);
            }}
            className="cursor-pointer"
          ></AddFillIcon>
        </div>
        <ul className="w-full h-[calc(100%-75px)] py-[10px] border border-[#E7EDF1] rounded overflow-auto">
          <div className="w-full">
            {channelList &&
              channelList.map((item) => {
                const { content } = item.content
                  ? JSON.parse(item.content)
                  : {
                      content: "",
                    };
                return (
                  <li
                    onClick={() => {
                      setCurrentChannel(item);
                      setIsRefreshUnRead(true);
                    }}
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between w-full h-[74px] cursor-pointer px-5",
                      currentChannel?.id === item.id
                        ? "bg-[#F4F6F9]"
                        : "hover:bg-[#F4F6F9]"
                    )}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <ChannelAvatar
                        channelType={item.type}
                        userList={item.userList}
                      ></ChannelAvatar>
                    </div>
                    <div className="flex items-stretch flex-wrap w-[calc(100%-68px)] mr-auto pt-[8px] pb-[9px]">
                      <div className="flex gap-2 items-center w-full mb-1">
                        <div
                          className="w-full overflow-hidden !text-ellipsis whitespace-nowrap text-[#324664] text-[16px] font-[450]"
                          title={setUserList(item)}
                        >
                          {/* <Tooltip content={setUserList(item)}> */}
                          {setUserList(item)}
                          {/* </Tooltip> */}
                        </div>

                        <div className="flex-shrink-0 w-auto text-right text-[#919FB4] text-[14px]">
                          {setLocalDateTime(
                            item.mesCreatedAt
                              ? item.mesCreatedAt
                              : item.channelCreatedAt
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full min-h-[21px]">
                        <div
                          title={content}
                          className="w-full overflow-hidden text-ellipsis text-nowrap text-[#919FB4] text-[14px] font-[390]"
                        >
                          {content}
                        </div>
                        <div className="flex-shrink-0">
                          <NumberCircle
                            className="h-4 min-w-4 text-[12px]"
                            number={item.unReadCount}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
          </div>
        </ul>
      </div>
    </Spin>
  );
};

export default ChannelList;
