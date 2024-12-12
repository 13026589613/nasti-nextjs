import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CompanyVo } from "@/api/admin/company/type";
/**
 * @description FormSchema for validation
 */
const FormSchemaEdit = z.object({
  name: z.string().min(1, {
    message: "This field is required.",
  }),
  createdAt: z.string(),
});

const FormSchemaAdd = z.object({
  name: z.string().min(1, {
    message: "This field is required.",
  }),
  createdAt: z.string(),
});

export type AdminUserFormValuesEdit = z.infer<typeof FormSchemaEdit>;
export type AdminUserFormValuesAdd = z.infer<typeof FormSchemaAdd>;

/**
 * @description useFormCreate hook to handle form data and validation for create dictionary item
 * @param params
 * @returns
 */
const useFormCreate = ({
  editItem,
  open,
}: {
  editItem: CompanyVo | null;
  open: boolean;
}) => {
  /**
   * @description useForm hook to handle form data and validation
   */

  const form = useForm<z.infer<typeof FormSchemaEdit>>({
    resolver: zodResolver(FormSchemaEdit),
    defaultValues: {
      name: editItem ? editItem.name : "",
      createdAt: editItem ? editItem.createdAt : "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: editItem ? editItem.name : "",
        createdAt: editItem ? editItem.createdAt : "",
      });
    }
  }, [open]);
  return {
    form,
  };
};

export default useFormCreate;
