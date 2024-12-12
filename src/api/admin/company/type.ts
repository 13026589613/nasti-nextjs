export type ListParams = {
  orderBy?: string;
  pageSize?: number;
  pageNum?: number;
};

export interface CompanyParams extends ListParams {
  id?: string;
  name?: string;
  userId?: string;
  isActive?: boolean;
}

export type CompanyVo = {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isDeleted: boolean;
  id: string;
  name: string;
  isActive: boolean;
  type?: string;
};

export type CompanyResponse = {
  size: number;
  records: CompanyVo[];
  current: number;
  total: number;
  pages: number;
};
