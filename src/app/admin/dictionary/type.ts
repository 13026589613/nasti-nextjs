import { ListParams } from "@/api/types";

export type DictinaryVo = {
  id: string;
  description: string;
  code: string;
  createdat?: string;
  deleted?: boolean;
  redirectUrl?: string;
};

export type Dictinary = Omit<DictinaryVo, "createdat" | "deleted">;

export type GetTypeDictinaryParams = ListParams | Partial<Dictinary>;

export type AddTypeDictinaryParams = Omit<Dictinary, "id">;

export type EditTypeDictinaryParams = Dictinary;

export type SearchParams = Partial<Omit<Dictinary, "id">>;
