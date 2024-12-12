"use client";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { channelListApi } from "@/api/chat";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useAppStore from "@/store/useAppStore";
import useChatMessageStore from "@/store/useChatMessageStore";
import AddFillIcon from "~/icons/AddFillIcon.svg";
import NotDataIcon from "~/images/not-data-2.svg";

import ChannelList from "./component/ChannelList";
import ChatView from "./component/chatView/ChatView";
import SelectUserDia from "./component/SelectUserDia";
import { ChannelListResponse } from "./type";

const MessagePage = () => {
  const { communityId } = useGlobalCommunityId();

  const { navbarWidth } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const { isRefreshChannel, setIsRefreshChannel } = useChatMessageStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const [currentChannel, setCurrentChannel] =
    useState<ChannelListResponse | null>(null);

  const [channelList, setChannelList] = useState<ChannelListResponse[]>([]);

  const [selectUserDia, setSelectUserDia] = useState(false);

  const [loading, setLoading] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const getAllChannelList = async () => {
    try {
      setLoading(true);
      const res = await channelListApi({
        webSearchCondition: searchValue ? searchValue : null,
        communityId,
      });
      if (res.code === 200) {
        const sortedData = res.data.sort(
          (a: ChannelListResponse, b: ChannelListResponse) => {
            let aTime = a.mesCreatedAt ? a.mesCreatedAt : a.channelCreatedAt;
            let bTime = b.mesCreatedAt ? b.mesCreatedAt : b.channelCreatedAt;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          }
        );
        setChannelList(sortedData);
        if (currentChannel === null && res.data.length > 0) {
          setCurrentChannel(sortedData[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) {
      getAllChannelList();
    }
  }, [searchValue, communityId]);

  useEffect(() => {
    if (isRefreshChannel) {
      getAllChannelList();
      setIsRefreshChannel(false);
    }
  }, [isRefreshChannel]);

  return (
    <PageContainer>
      <div
        style={{
          width: navbarWidth - 30,
        }}
        className="h-[calc(100vh-150px)]  overflow-x-auto"
      >
        <PageTitle className="mb-[9px]" title="Messages" isClose={false} />
        <div className="flex justify-between gap-[50px] h-[calc(100%-45px)] w-full">
          {channelList.length !== 0 && (
            <>
              <div className="flex-shrink-0  w-[422px] h-full pt-[22px]">
                <ChannelList
                  currentChannel={currentChannel}
                  setCurrentChannel={(data) => {
                    setCurrentChannel(null);
                    setTimeout(() => {
                      setCurrentChannel(data);
                    }, 50);
                  }}
                  loading={loading}
                  channelList={channelList}
                  searchValue={searchValue}
                  setSelectUserDia={setSelectUserDia}
                  setSearchValue={setSearchValue}
                ></ChannelList>
              </div>
              <div className="w-[calc(100%-522px)]  h-full ">
                {currentChannel && (
                  <ChatView
                    currentChannel={currentChannel}
                    channelList={channelList}
                    setChannelList={setChannelList}
                  ></ChatView>
                )}
                {!currentChannel && channelList.length === 0 && (
                  <div className="flex items-center justify-center flex-wrap w-full h-full">
                    <div>
                      <NotDataIcon className="mb-0" />
                      <div className="w-full h-10 text-center text-primary text-6">
                        No data available
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {channelList.length === 0 && (
            <div className="flex items-center justify-center flex-wrap w-full h-full">
              <div>
                <NotDataIcon className="mb-0" />
                <div className="w-full h-10 text-center text-primary text-6">
                  No data available
                </div>

                <div className="flex justify-center mt-10">
                  <div
                    onClick={() => {
                      setSelectUserDia(true);
                    }}
                    className="flex items-center justify-center gap-3 w-[260px] h-[70px] cursor-pointer bg-[#EB1DB2]"
                  >
                    <AddFillIcon color="#fff"></AddFillIcon>
                    <div className="text-[18px] text-[#fff] font-[450]">
                      Create a new chat
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {selectUserDia && (
          <SelectUserDia
            open={selectUserDia}
            onClose={() => {
              setSelectUserDia(false);
            }}
            onSuccess={(data) => {
              setCurrentChannel(data);
              getAllChannelList();
            }}
          ></SelectUserDia>
        )}
      </div>
    </PageContainer>
  );
};

export default MessagePage;
