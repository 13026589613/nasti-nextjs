"use client";

import Avatar from "../Avatar";

interface MessageMyselfProps {
  userName: string;
  time: string;
  image: string;
  children: React.ReactNode;
}

const MessageMyself = (props: MessageMyselfProps) => {
  const { userName, time, children, image } = props;

  return (
    <div className="w-full flex justify-end mb-2">
      <div className="flex items-start justify-end gap-4 min-w-[498px] w-[47%]">
        <div className="max-w-[calc(100%-68px)]">
          <div className="w-full text-ellipsis text-nowrap text-[14px] text-[#666666] font-[420] text-end overflow-hidden">
            You
          </div>
          <div className="p-4 mt-2 bg-[#EB1DB2] rounded-[6px] rounded-tr-[0px]">
            {children}
          </div>
          <div className="mt-2 text-[#949494] text-[14px] font-[390] text-end">
            {time}
          </div>
        </div>

        <Avatar
          width={52}
          height={52}
          className="flex-shrink-0 rounded-[50%] h-[52px] w-[52px] mr-4"
          url={image}
          userName={userName}
        ></Avatar>
      </div>
    </div>
  );
};

export default MessageMyself;
