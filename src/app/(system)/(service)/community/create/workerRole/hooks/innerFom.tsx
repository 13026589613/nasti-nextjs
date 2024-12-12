import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { WorkerRoleDept } from "../types";

/**
 * @description useFormCreate hook to handle form data and validation for create dictionary item
 * @param param0
 * @returns
 */
const useFormCreate = ({
  editInnerItem,
  open,
}: {
  editInnerItem: WorkerRoleDept | null;
  open: boolean;
}) => {
  /**
   * @description FormSchema for validation
   */
  const FormSchema = z.object({
    code: z.string().min(1, {
      message: "This field is required.",
    }),
    hppdTargetHour: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) {
            return true;
          }
          const emailRegex = /^\d*(\.\d*)?$/;
          return emailRegex.test(value);
        },
        {
          message: "Digital format required",
        }
      ),
    id: z.string().optional(),
  });

  const getString = (value: string | null) => {
    if (value) {
      return Number(value) % 1 !== 0
        ? Number(value).toFixed(2)
        : Number(value).toFixed(0);
    } else {
      return "";
    }
  };

  /**
   * @description useForm hook to handle form data and validation
   */
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      hppdTargetHour: editInnerItem
        ? getString(editInnerItem.hppdTargetHour)
        : "",
      code: editInnerItem ? editInnerItem.code : "5",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        hppdTargetHour: editInnerItem
          ? getString(editInnerItem.hppdTargetHour)
          : "",
        code: editInnerItem ? editInnerItem.code || "" : "",
      });
    }
  }, [open, editInnerItem]);
  return {
    innerForm: form,
  };
};

export default useFormCreate;
