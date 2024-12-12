import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LocationVo } from "../types";

/**
 * @description useFormCreate hook to handle form data and validation for create dictionary item
 * @param param0
 * @returns
 */
const useFormCreate = ({
  editItem,
  open,
}: {
  editItem: LocationVo | null;
  open: boolean;
}) => {
  /**
   * @description FormSchema for validation
   */
  const FormSchema = z.object({
    name: z.string().min(1, {
      message: "This field is required.",
    }),
    description: z.string().optional(),
  });

  /**
   * @description useForm hook to handle form data and validation
   */
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: (editItem && editItem.name) || "",
      description: (editItem && editItem.description) || "",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        name: (editItem && editItem.name) || "",
        description: (editItem && editItem.description) || "",
      });
    }
  }, [open]);
  return {
    form,
  };
};

export default useFormCreate;
