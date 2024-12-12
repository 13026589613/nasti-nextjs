"use client";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { sendMessageApi } from "@/api/chat";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import SendInputIcon from "~/icons/SendInputIcon.svg";

import { ChannelListResponse } from "../../type";

interface SendMessageType {
  currentChannel: ChannelListResponse | null;
}

const SendMessageInput = (props: SendMessageType) => {
  const { currentChannel } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [sendValue, setSendValue] = useState("");

  const handleResize = (height?: number) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      if (height) {
        textareaRef.current.style.height = `${height}px`;
      } else {
        if (textareaRef.current.scrollHeight >= 200) {
          textareaRef.current.style.height = `200px`;
        } else {
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      }
    }
  };

  useEffect(() => {
    handleResize(24);
  }, []);

  const [isSending, setIsSending] = useState(false);

  const SendMessageFn = async () => {
    try {
      setIsSending(true);
      const res = await sendMessageApi({
        channelId: currentChannel?.id as string,
        content: {
          type: "TEXT",
          content: sendValue.trimStart(),
        },
      });

      if (res.code === 200) {
        setSendValue("");
      }
    } finally {
      setSendValue("");
      handleResize(24);
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (sendValue.trimStart().length > 0 && !isSending) {
        SendMessageFn();
      }
    }
  };

  useEffect(() => {
    setSendValue("");
    handleResize(24);
  }, [currentChannel]);

  return (
    <div className=" w-full border-t-[1px] border-[#E4E4E4]">
      <div className="flex items-center gap-[24px] w-full h-full pt-5 pb-2 px-[15px] rounded-[10px]  ">
        <div className="w-full py-4 rounded-[12px] bg-[#F3F6F6]">
          <Textarea
            ref={textareaRef}
            rows={1}
            value={sendValue}
            placeholder="Please type no more than 1,000 characters."
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 1024) {
                setSendValue(e.target.value);
              } else {
                setSendValue(value.slice(0, 1024));
              }
            }}
            onInput={(e) => {
              handleResize();
            }}
            onKeyDown={handleKeyDown}
            className="max-h-[200px] min-h-0 px-[18px] py-0 border-0 bg-[#F3F6F6] text-[#949494] text-[14px] leading-6 resize-none"
          ></Textarea>
        </div>
        <div className="flex-shrink-0 relative">
          {!isSending ? (
            <SendInputIcon
              color={sendValue.trimStart().length > 0 ? "#EB1DB2" : "#BDBDBD"}
              onClick={() => {
                if (sendValue.trimStart().length > 0 && !isSending) {
                  SendMessageFn();
                }
              }}
              className={cn(
                "w-[20px] h-[20px]",
                sendValue.trimStart().length > 0 ? "cursor-pointer" : ""
              )}
            ></SendInputIcon>
          ) : (
            <Loader2 className="animate-spin text-primary"></Loader2>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendMessageInput;
