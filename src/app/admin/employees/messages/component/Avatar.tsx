import Image from "next/image";

import { cn } from "@/lib/utils";
import { getImageFile } from "@/utils/getFileUrl";
interface AvatarProps {
  userName: string;
  url?: string;
  width: number;
  height: number;
  className?: string;
}

const Avatar = (props: AvatarProps) => {
  const { userName, width, height, url, className } = props;

  if (url) {
    return (
      <Image
        loading="lazy"
        className={cn(className)}
        src={getImageFile(url)}
        alt={userName}
        width={width}
        unoptimized={true}
        height={height}
      />
    );
  } else {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-200 text-gray-500",
          className
        )}
        style={{ width, height }}
      >
        {userName.slice(0, 1).toUpperCase()}
      </div>
    );
  }
};

export default Avatar;
