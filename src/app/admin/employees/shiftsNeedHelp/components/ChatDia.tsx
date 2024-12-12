import Dialog from "@/components/custom/Dialog";

import ChatView from "../../messages/component/chatView/ChatView";
import { ChannelListResponse } from "../../messages/type";
interface ChatDiaProps {
  currentChannel: ChannelListResponse | null;
  onClose: () => void;
}
const ChatDia = (props: ChatDiaProps) => {
  const { currentChannel, onClose } = props;

  return (
    <Dialog
      open
      width="50vw"
      titleWrapperClassName="hidden"
      contentWrapperClassName=" p-0 pt-[4px] min-w-[600px]"
    >
      <div className="w-full h-[calc(100vh-100px)]">
        <ChatView
          currentChannel={currentChannel}
          showClose
          onClose={onClose}
        ></ChatView>
      </div>
    </Dialog>
  );
};
export default ChatDia;
