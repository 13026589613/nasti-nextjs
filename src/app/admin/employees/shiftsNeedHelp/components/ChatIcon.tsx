import { Loader2 } from "lucide-react";
import React, { useState } from "react";

import { createChannel } from "@/api/chat";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useUserInfo from "@/hooks/useUserInfo";
import MessageShiftIcon from "~/icons/MessageShiftIcon.svg";

import { ChannelListResponse } from "../../messages/type";
import ChatDia from "./ChatDia";
interface ChatIconProps {
  targetUserId: string;
  chatIcon?: React.ReactNode;
}

const ChatIcon = (props: ChatIconProps) => {
  const { targetUserId, chatIcon } = props;

  const { communityId } = useGlobalCommunityId();

  const { userId } = useUserInfo();

  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channelData, setChannelData] = useState<ChannelListResponse | null>(
    null
  );

  const handleChatModalOpen = async () => {
    try {
      setLoading(true);
      const res = await createChannel({
        userIds: [targetUserId],
        communityId,
      });
      if (res.code === 200) {
        setChannelData(res.data[0]);
        setChatModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {userId !== targetUserId && !loading && !chatIcon && (
        <MessageShiftIcon
          onClick={handleChatModalOpen}
          color="#3FBD6B"
          className="w-4 h-4  cursor-pointer"
        ></MessageShiftIcon>
      )}
      {userId !== targetUserId && !loading && chatIcon && (
        <div onClick={handleChatModalOpen} className="inline-block">
          {chatIcon}
        </div>
      )}
      {loading && <Loader2 className="animate-spin text-primary w-4 h-4 " />}
      {chatModalOpen && (
        <ChatDia
          currentChannel={channelData}
          onClose={() => {
            setChatModalOpen(false);
          }}
        ></ChatDia>
      )}
    </>
  );
};

export default ChatIcon;
