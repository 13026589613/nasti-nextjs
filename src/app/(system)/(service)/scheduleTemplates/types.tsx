import { GetScheduleTemplateListRecord } from "@/api/scheduleTemplates/types";

export type DialogInfoType = {
  open: boolean;
  copyItem: GetScheduleTemplateListRecord | null;
};
