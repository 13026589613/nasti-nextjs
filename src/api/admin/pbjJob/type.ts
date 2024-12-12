export type ListParams = {
  orderBy?: string;
  pageSize?: number;
  pageNum?: number;
};

export interface GetPbjJobParams extends ListParams {
  name?: string;
  code?: string;
}

export type GetPbjJobResponse = {
  size: number;
  records: PbjJobVo[];
  current: number;
  total: number;
  pages: number;
};

export type PbjJobVo = {
  id: string;
  code: string;
  name: string;
  isSystem: boolean;
  companyId: string;
  communityId: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isDeleted: boolean;
};

export interface PbjJobParams {
  id?: string;
  code: string;
  name: string;
  categoryId: string;
  categoryCode?: string;
}

export interface SearchParams {
  code?: string;
  name?: string;
  condition?: string;
  categoryName: string;
}

export interface EditPbjCategotyParams {
  deleteList: string[];
  categoryList: CategoryList[];
}
export interface CategoryList {
  id?: string;
  name: string;
  code: string;
}
