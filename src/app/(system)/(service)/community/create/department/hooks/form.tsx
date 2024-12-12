import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DepartmentVo } from "../types";

/**
 * @description useFormCreate hook to handle form data and validation for create dictionary item
 * @param param0
 * @returns
 */
const useFormCreate = ({
  editItem,
  open,
}: {
  editItem: DepartmentVo | null;
  open: boolean;
}) => {
  /**
   * @description FormSchema for validation
   */
  const FormSchema = z
    .object({
      name: z.string().min(1, {
        message: "This field is required.",
      }),
      description: z.string(),
      location: z.array(z.any()),
      newIsHppd: z.string(),
      newIsReportPbjHour: z.string(),
      newIsTrackCensus: z.string(),
    })
    .partial();

  /**
   * @description useForm hook to handle form data and validation
   */
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: (editItem && editItem.name) || "",
      description: (editItem && editItem.description) || "",
      location: editItem
        ? editItem.locationList
          ? editItem.locationList
          : []
        : [],
      newIsHppd: (editItem && editItem.newIsHppd) || "Yes",
      newIsReportPbjHour: (editItem && editItem.newIsReportPbjHour) || "Yes",
      newIsTrackCensus: (editItem && editItem.newIsTrackCensus) || "Yes",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        name: (editItem && editItem.name) || "",
        description: (editItem && editItem.description) || "",
        location: editItem
          ? editItem.locationList
            ? editItem.locationList
            : []
          : [],
        newIsHppd: (editItem && editItem.newIsHppd) || "Yes",
        newIsReportPbjHour: (editItem && editItem.newIsReportPbjHour) || "Yes",
        newIsTrackCensus: (editItem && editItem.newIsTrackCensus) || "Yes",
      });
    }
  }, [open, editItem]);
  return {
    form,
  };
};

export default useFormCreate;
