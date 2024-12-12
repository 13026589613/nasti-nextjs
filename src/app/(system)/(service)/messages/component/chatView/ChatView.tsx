"use client";
import { useSetState } from "ahooks";
import moment from "moment";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { messageListApi, upDateLeaveTimeApi } from "@/api/chat";
import useGlobalTime from "@/hooks/useGlobalTime";
import useUserInfo from "@/hooks/useUserInfo";
import { cn } from "@/lib/utils";
import useChatMessageStore from "@/store/useChatMessageStore";
import useUserStore from "@/store/useUserStore";
import CoarseClose from "~/icons/CoarseClose.svg";

import {
  ChannelListResponse,
  MessageListResponse,
  UserListItem,
} from "../../type";
import MessageMyself from "./MessageMyself";
import MessageOther from "./MessageOther";
import MessageText from "./MessageText";
import SendMessageInput from "./SendMessage";

interface ChatViewProps {
  currentChannel: ChannelListResponse | null;
  channelList?: ChannelListResponse[];
  setChannelList?: Dispatch<SetStateAction<ChannelListResponse[]>>;
  showClose?: boolean;
  onClose?: () => void;
}

const ChatView = (props: ChatViewProps) => {
  const {
    currentChannel,
    channelList,
    setChannelList,
    showClose = false,
    onClose,
  } = props;

  const { userId } = useUserInfo();

  const { localMoment, UTCMoment, receivedTimeZone } = useGlobalTime();

  const { userInfo } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const {
    isReceivedMessage,
    newMessage,
    setCurrentChannelArn,
    setIsReceivedMessage,
  } = useChatMessageStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollInnerRef = useRef<HTMLDivElement>(null);

  const [isRefresh, setIsRefresh] = useState(true);

  const [containerHeight, setContainerHeight] = useState(0);
  const [isKeepPosition, setIsKeepPosition] = useState(false);
  const canRefresh = useRef(true);
  const hasEnd = useRef(false);

  const [messageInfo, setMessageInfo] = useSetState({
    loading: false,
    lastViewTime: "",
    isToBottom: true,
    messages: [] as MessageListResponse[],
  });

  const getMessageList = async (
    isRefreshList: boolean,
    lastViewTime?: string
  ) => {
    try {
      setMessageInfo({ loading: true });
      let lastTime: null | string | undefined = lastViewTime;

      if (!lastTime) {
        if (!messageInfo.lastViewTime) {
          lastTime = null;
        } else {
          lastTime = messageInfo.lastViewTime;
        }
      }
      const res = await messageListApi({
        size: 15,
        lastViewTime: lastTime,
        channelId: currentChannel?.id as string,
      });
      if (res.code === 200) {
        const data = res.data.records.reverse();

        if (data.length < 15) {
          hasEnd.current = true;
        }

        upDateLeaveTime(currentChannel?.id as string);
        if (channelList && setChannelList) {
          const channel = channelList?.find(
            (item) => item.id === currentChannel?.id
          );

          if (channel && channel.unReadCount > 0) {
            setChannelList &&
              setChannelList(
                channelList.map((item) => {
                  if (item.id === currentChannel?.id) {
                    return {
                      ...item,
                      unReadCount: 0,
                    };
                  }

                  return item;
                })
              );
          }
        }

        if (isRefreshList) {
          setMessageInfo({
            messages: data,
            lastViewTime:
              data.length > 0
                ? moment
                    .tz(data[0].createdAt, receivedTimeZone)
                    .format("MM/DD/YYYY HH:mm:ss")
                : messageInfo.lastViewTime,
          });
        } else {
          setMessageInfo({
            messages: [...data, ...messageInfo.messages],
            lastViewTime:
              data.length > 0
                ? moment
                    .tz(data[0].createdAt, receivedTimeZone)
                    .format("MM/DD/YYYY HH:mm:ss")
                : messageInfo.lastViewTime,
          });
        }

        if (!messageInfo.isToBottom) {
          setIsKeepPosition(true);
        }
      }
    } finally {
      setMessageInfo({ loading: false });
      setIsRefresh(true);
      //Increase refresh frustration
      setTimeout(() => {
        canRefresh.current = true;
      }, 500);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current && scrollInnerRef.current) {
      const scrollArea = scrollAreaRef.current;
      const scrollInner = scrollInnerRef.current;
      const scrollAreaHeight = scrollArea.clientHeight;
      const scrollInnerHeight = scrollInner.clientHeight;

      if (scrollAreaHeight < scrollInnerHeight) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }
  };

  const scrollHandler = () => {
    const scrollArea = scrollAreaRef.current;
    const scrollTop = scrollArea?.scrollTop || 0;

    if (scrollTop <= 90) {
      if (canRefresh.current && !hasEnd.current) {
        canRefresh.current = false;
        setIsRefresh(false);
      }
    }
  };

  useEffect(() => {
    if (!isRefresh) {
      getMessageList(false);
    }
  }, [isRefresh]);

  const upDateLeaveTime = async (channelId: string) => {
    const res = await upDateLeaveTimeApi(channelId);
    res.code === 200 && useChatMessageStore.getState().setIsRefreshUnRead(true);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.addEventListener("scroll", scrollHandler);
    }
    return () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.removeEventListener("scroll", scrollHandler);
      }
    };
  }, [scrollAreaRef]);

  useEffect(() => {
    getMessageList(true, "");
    if (currentChannel) {
      setCurrentChannelArn(currentChannel.channelArn);
    }
    return () => {
      setCurrentChannelArn("");
    };
  }, [currentChannel]);

  useEffect(() => {
    if (messageInfo.isToBottom && messageInfo.messages.length > 0) {
      setMessageInfo({ isToBottom: false });
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
    if (messageInfo.messages.length > 0) {
      setContainerHeight(scrollInnerRef.current?.clientHeight ?? 0);
    }

    if (isKeepPosition) {
      let scrollHeight = scrollInnerRef.current?.scrollHeight ?? 0;
      let beforeHeight = containerHeight;
      scrollAreaRef.current?.scrollTo(0, scrollHeight - beforeHeight);
    }
  }, [messageInfo.messages, messageInfo.isToBottom, isKeepPosition]);

  useEffect(() => {
    if (isReceivedMessage) {
      const { ChannelArn, MessageId, Content, Sender, CreatedTimestamp } =
        newMessage;

      if (setChannelList && channelList) {
        setChannelList(
          channelList
            .map((channel) => {
              if (channel.channelArn === ChannelArn) {
                if (
                  channel.channelArn !== currentChannel?.channelArn &&
                  Sender.Name !== userId
                ) {
                  return {
                    ...channel,
                    unReadCount: channel.unReadCount + 1,
                    content: Content,
                    mesCreatedAt: CreatedTimestamp,
                  };
                } else {
                  return {
                    ...channel,
                    content: Content,
                    mesCreatedAt: CreatedTimestamp,
                  };
                }
              }
              return channel;
            })
            .sort((a, b) => {
              const aTime = a.mesCreatedAt
                ? a.mesCreatedAt
                : a.channelCreatedAt;
              const bTime = b.mesCreatedAt
                ? b.mesCreatedAt
                : b.channelCreatedAt;
              return new Date(bTime).getTime() - new Date(aTime).getTime();
            })
        );
      }

      if (ChannelArn === currentChannel?.channelArn) {
        upDateLeaveTime(currentChannel?.id as string);
        setMessageInfo({
          messages: [
            ...messageInfo.messages,
            {
              id: MessageId,
              channelId: ChannelArn,
              content: Content,
              userId: Sender.Name,
              text: Content,
              communityId: "",
              createdAt: CreatedTimestamp,
            },
          ],
          isToBottom: true,
        });
      }

      setIsReceivedMessage(false);
    }
  }, [isReceivedMessage]);

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
  const getName = (userList: UserListItem[]) => {
    return userList
      .filter((inner) => {
        if (userList.length === 2) {
          return inner.userId !== userId;
        } else {
          return true;
        }
      })
      .map((user) => {
        return `${user.firstName} ${user.lastName}`;
      })
      .join(", ");
  };

  const getUserImage = (userList: UserListItem[], userId: string) => {
    return (
      userList.find((user) => user.userId === userId)?.portraitFileId || ""
    );
  };
  return (
    <div className="flex flex-col min-w-[550px] w-full h-full pt-2 px-[15px]">
      <div className="flex-shrink-0 flex items-center gap-4 w-full h-10 mb-3">
        <div
          className={cn(
            " overflow-hidden text-ellipsis text-nowrap text-[#324664] text-[18px] font-[450] leading-10",
            showClose ? "w-[calc(100%-46px)]" : "w-full"
          )}
          title={getName(
            currentChannel?.userList ? currentChannel?.userList : []
          )}
        >
          {getName(currentChannel?.userList ? currentChannel?.userList : [])}
        </div>
        {showClose && (
          <CoarseClose
            className="cursor-pointer"
            width="26"
            height="26"
            onClick={() => {
              onClose && onClose();
            }}
          ></CoarseClose>
        )}
      </div>
      <div
        ref={scrollAreaRef}
        className={cn(
          "relative h-[calc(100%-142px)] w-full py-4 overflow-auto border-t border-[#F2F2F2]"
        )}
      >
        <div ref={scrollInnerRef} className="w-full pr-3">
          {messageInfo?.messages?.map((message) => {
            const userNow = currentChannel?.userList.find(
              (user) => user.userId === message.userId
            );

            let userNowName = "";

            if (userNow?.firstName && userNow?.lastName) {
              userNowName = `${userNow?.firstName} ${userNow?.lastName}`;
            }

            const { content } = message.content
              ? JSON.parse(message.content)
              : { content: "" };

            if (message.userId === userInfo?.id) {
              return (
                <MessageMyself
                  key={message.id}
                  userName={userNowName}
                  image={getUserImage(
                    currentChannel?.userList as UserListItem[],
                    message.userId
                  )}
                  time={setLocalDateTime(message.createdAt)}
                >
                  <MessageText type="MYSELF" content={content} />
                </MessageMyself>
              );
            }
            return (
              <MessageOther
                userName={userNowName}
                time={setLocalDateTime(message.createdAt)}
                key={message.id}
                image={getUserImage(
                  currentChannel?.userList as UserListItem[],
                  message.userId
                )}
              >
                <MessageText type="OTHER" content={content} />
              </MessageOther>
            );
          })}
        </div>
      </div>
      <div className="flex-shrink-0 mt-2">
        <SendMessageInput currentChannel={currentChannel} />
      </div>
    </div>
  );
};

export default ChatView;
