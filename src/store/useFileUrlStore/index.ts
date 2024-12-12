import moment from "moment";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getFileUrlInfo } from "@/api/sys";

export type DeviceType = "desktop" | "table" | "mobile";

interface FileItem {
  id: string;
  url: string;
  expiredTimeUtc: string;
}

interface AppStateTypes {
  fileList: FileItem[];
  setFileList: (fileList: FileItem[]) => void;
  getFileUrlById: (id: string) => Promise<string | undefined>;
}

const useAppStore = create(
  persist<AppStateTypes>(
    (set, get) => ({
      fileList: [],
      setFileList: (fileList: FileItem[]) => set({ fileList }),
      getFileUrlById: async (id: string) => {
        const { fileList } = get();
        const file = fileList.find((item) => item.id === id);

        if (file && moment(file.expiredTimeUtc).isAfter(moment())) {
          return file.url;
        }
        try {
          const { data, code } = await getFileUrlInfo(id);
          if (code === 200) {
            let newFileList = [
              ...fileList,
              { id, url: data.url, expiredTimeUtc: data.expiredTimeUtc },
            ];
            if (file) {
              newFileList = fileList.map((item) =>
                item.id === id
                  ? { id, url: data.url, expiredTimeUtc: data.expiredTimeUtc }
                  : item
              );
            }
            set({ fileList: newFileList });
            return data.url;
          }
        } catch (error) {
          console.error("getFileUrlById error", error);
          return undefined;
        }
      },
    }),
    {
      name: "freebird-fileList-store",
    }
  )
);

export default useAppStore;
