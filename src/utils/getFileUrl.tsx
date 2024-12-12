import { apiBaseUrl } from "@/env";

export const getImageFile = (fileId: string) => {
  return `${apiBaseUrl}/api/thirdparty/file/download/stream/${fileId}`;
};
