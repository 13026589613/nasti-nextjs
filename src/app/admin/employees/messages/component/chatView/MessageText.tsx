import Autolinker from "autolinker";

import { cn } from "@/lib/utils";
interface MessageProps {
  type: keyof typeof textColor;
  content: string;
}

const textColor = {
  OTHER: "text-[#342F2E]",
  MYSELF: "text-[#FFFFFF]",
};

const MessageText = (props: MessageProps) => {
  const { type, content } = props;

  const contentWithLineBreaks = content.replace(/\n/g, "<br>");

  const linkedText = Autolinker.link(contentWithLineBreaks, {
    newWindow: true,
    className: "text-[blue] underline",
    stripPrefix: false,
  });

  return (
    <div
      className={cn("text-wrap w-full break-words", textColor[type])}
      dangerouslySetInnerHTML={{
        __html: linkedText,
      }}
    ></div>
  );
};

export default MessageText;
