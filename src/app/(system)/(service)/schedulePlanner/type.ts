import { ListParams } from "@/api/types";

export type SchedulePlannerVo = {
  id: string;
  communityId: string;
  departmentId: string;
  weekOfYear: number;
  startDate: string;
  endDate: string;
  templateId: string;
  isPublished: boolean;
  year: number;
  createdAt: string;
  isCreate: boolean;
  templateName: string;
  key: string | number;
};

export type GetTypeSchedulePlannerParams =
  | ListParams
  | Partial<SchedulePlannerVo>
  | {
      communityId: string;
      departmentId: string;
      year: string;
    };

export type GetTypeSchedulePlannerResponse = SchedulePlannerVo[];

export type SearchParams = Partial<{
  communityId: string;
  departmentId: string;
  year: string;
}>;
export type GetTemplateParams = Omit<SearchParams, "year">;
