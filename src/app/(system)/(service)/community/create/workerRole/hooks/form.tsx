import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { WorkerRoleVo } from "../types";

/**
 * @description useFormCreate hook to handle form data and validation for create dictionary item
 * @param param0
 * @returns
 */
const useFormCreate = ({
  editItem,
  open,
}: {
  editItem: WorkerRoleVo | null;
  open: boolean;
}) => {
  /**
   * @description FormSchema for validation
   */
  const FormSchema = z.object({
    code: z.string(),
    name: z.string().min(1, {
      message: "This field is required.",
    }),
    color: z.string(),
  });

  /**
   * @description useForm hook to handle form data and validation
   */
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: (editItem && editItem.code) || "",
      name: (editItem && editItem.name) || "",
      color: (editItem && editItem.color) || "#000000",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        code: (editItem && editItem.code) || "",
        name: (editItem && editItem.name) || "",
        color: (editItem && editItem.color) || "#000000",
      });
    }
  }, [open, editItem]);
  return {
    form,
  };
};

export default useFormCreate;
