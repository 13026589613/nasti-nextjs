"use client";

import Avatar from "../Avatar";

interface MessageOtherProps {
  userName: string;
  time: string;
  image: string;
  children: React.ReactNode;
}

const MessageOther = (props: MessageOtherProps) => {
  const { userName, time, children, image } = props;

  return (
    <div className="w-full mb-2">
      <div className="flex items-start gap-4 min-w-[498px] w-[47%]">
        <Avatar
          width={52}
          height={52}
          className="flex-shrink-0 rounded-[50%] h-[52px] w-[52px] mr-4"
          url={image}
          userName={userName}
        ></Avatar>
        <div className="max-w-[calc(100%-68px)]">
          <div className="w-full text-ellipsis text-nowrap text-[14px] text-[#666666] font-[420] overflow-hidden">
            {userName}
          </div>
          <div className="p-4 mt-2 bg-[#F2F7FB] rounded-[6px] rounded-tl-[0px]">
            {children}
          </div>
          <div className="mt-2 text-[#949494] text-[14px] font-[390]">
            {time}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageOther;
