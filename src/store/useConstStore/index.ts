"use client";
import { create } from "zustand";

type constDictType = {
  label: string;
  value: string;
};

type constType = {
  listData: constDictType[];
  setListData: (listData: constDictType[]) => void;
};

const useDictStore = create<constType>((set) => ({
  listData: [],
  setListData: (listData: constDictType[]) => {
    set(() => ({
      listData,
    }));
  },
  logout() {
    set(() => ({
      listData: [],
    }));
  },
}));

export default useDictStore;
