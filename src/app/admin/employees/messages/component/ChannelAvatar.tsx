import useUserInfo from "@/hooks/useUserInfo";
import { cn } from "@/lib/utils";

import { UserListItem } from "../type";
import Avatar from "./Avatar";

interface ChannelAvatarProps {
  userList: UserListItem[];
  channelType: 0 | 1; //0 single 1group
}

const ChannelAvatar = (props: ChannelAvatarProps) => {
  const { userList, channelType } = props;

  const { userId } = useUserInfo();

  if (userList.length === 2) {
    const firstUser = userList[0];
    const secondUser = userList[1];
    if (channelType === 0) {
      let targetUser = firstUser;
      if (firstUser.userId === userId) {
        targetUser = secondUser;
      }
      return (
        <Avatar
          width={52}
          height={52}
          className="w-[52px] h-[52px] rounded-[50%] overflow-hidden"
          userName={targetUser.firstName}
          url={targetUser.portraitFileId}
        />
      );
    }
    return (
      <div className="flex w-[52px] h-[52px] gap-[2px] rounded-[50%] overflow-hidden">
        <div className="relative w-[50%] h-full overflow-hidden">
          <Avatar
            width={52}
            height={52}
            className={cn(
              "w-[52px] h-[52px]",
              !firstUser.portraitFileId && "absolute left-[-50%] "
            )}
            userName={firstUser.firstName}
            url={firstUser.portraitFileId}
          />
        </div>
        <div className="relative w-[50%] h-full overflow-hidden">
          <Avatar
            width={52}
            height={52}
            className={cn(
              "w-[52px] h-[52px]",
              !secondUser.portraitFileId && "absolute left-[-50%]"
            )}
            userName={secondUser.firstName}
            url={secondUser.portraitFileId}
          />
        </div>
      </div>
    );
  } else if (userList.length === 3) {
    const firstUser = userList[0];
    const secondUser = userList[1];
    const thirdUser = userList[2];
    return (
      <div className="flex w-[52px] h-[52px] rounded-[50%] overflow-hidden bg-white gap-[2px]">
        <div className="relative w-[50%] h-full overflow-hidden">
          <Avatar
            width={52}
            height={52}
            className={cn(
              "w-[52px] h-[52px]",
              !firstUser.portraitFileId && "absolute left-[-50%] "
            )}
            userName={firstUser.firstName}
            url={firstUser.portraitFileId}
          />
        </div>
        <div className="flex flex-col gap-[2px] w-[50%] h-full overflow-hidden">
          <div className="relative w-full h-[50%] overflow-hidden">
            <Avatar
              width={52}
              height={52}
              className={cn(
                "w-[52px] h-[52px]",
                !secondUser.portraitFileId && "absolute left-[-65%] top-[-50%]"
              )}
              userName={secondUser.firstName}
              url={secondUser.portraitFileId}
            />
          </div>
          <div className="relative w-full h-[50%] overflow-hidden">
            <Avatar
              width={52}
              height={52}
              className={cn(
                "w-[52px] h-[52px]",
                !thirdUser.portraitFileId && "absolute left-[-65%] top-[-55%]"
              )}
              userName={thirdUser.firstName}
              url={thirdUser.portraitFileId}
            />
          </div>
        </div>
      </div>
    );
  } else if (userList.length > 3) {
    const firstUser = userList[0];
    const secondUser = userList[1];
    const thirdUser = userList[2];
    const fourthUser = userList[3];

    return (
      <div className="flex w-[52px] h-[52px] rounded-[50%] overflow-hidden bg-white gap-[2px]">
        <div className="flex flex-col gap-[2px] w-[50%] h-full overflow-hidden">
          <div className="relative w-full h-[50%] overflow-hidden">
            <Avatar
              width={52}
              height={52}
              className={cn(
                "w-[52px] h-[52px]",
                !firstUser.portraitFileId && "absolute left-[-45%] top-[-50%] "
              )}
              userName={firstUser.firstName}
              url={firstUser.portraitFileId}
            />
          </div>
          <div className="relative w-full h-[50%] overflow-hidden">
            <Avatar
              width={52}
              height={52}
              className={cn(
                "w-[52px] h-[52px]",
                !secondUser.portraitFileId && "absolute left-[-45%] top-[-55%]"
              )}
              userName={secondUser.firstName}
              url={secondUser.portraitFileId}
            />
          </div>
        </div>
        <div className="flex flex-col gap-[2px] w-[50%] h-full overflow-hidden">
          <div className="relative w-full h-[50%] overflow-hidden">
            <Avatar
              width={52}
              height={52}
              className={cn(
                "w-[52px] h-[52px]",
                !thirdUser.portraitFileId && "absolute left-[-65%] top-[-50%]"
              )}
              userName={thirdUser.firstName}
              url={thirdUser.portraitFileId}
            />
          </div>
          <div className="relative w-full h-[50%] overflow-hidden">
            <Avatar
              width={52}
              height={52}
              className={cn(
                "w-[52px] h-[52px]",
                !fourthUser.portraitFileId && "absolute left-[-65%] top-[-55%]"
              )}
              userName={fourthUser.firstName}
              url={fourthUser.portraitFileId}
            />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <Avatar
        width={52}
        height={52}
        className="w-[52px] h-[52px] rounded-[50%] overflow-hidden"
        userName={userList[0].firstName}
        url={userList[0].portraitFileId}
      />
    );
  }
  return <></>;
};

export default ChannelAvatar;
