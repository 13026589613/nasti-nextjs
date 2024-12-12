import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PbjJobVo } from "../types";

/**
 * @description useFormCreate hook to handle form data and validation for create dictionary item
 * @param param0
 * @returns
 */
const useFormCreate = ({
  editItem,
  open,
}: {
  editItem: PbjJobVo | null;
  open: boolean;
}) => {
  /**
   * @description FormSchema for validation
   */
  const FormSchema = z.object({
    code: z.string().min(1, {
      message: "This field is required.",
    }),
    name: z.string().min(1, {
      message: "This field is required.",
    }),
    isSystem: z.boolean(),
    companyId: z.string().min(1, {
      message: "This field is required.",
    }),
    communityId: z.string().min(1, {
      message: "This field is required.",
    }),
  });

  /**
   * @description useForm hook to handle form data and validation
   */
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: editItem ? editItem.code : "",
      name: editItem ? editItem.name : "",
      isSystem: editItem ? editItem.isSystem : false,
      companyId: editItem ? editItem.companyId : "",
      communityId: editItem ? editItem.communityId : "",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        code: editItem ? editItem.code : "",
        name: editItem ? editItem.name : "",
        isSystem: editItem ? editItem.isSystem : false,
        companyId: editItem ? editItem.companyId : "",
        communityId: editItem ? editItem.communityId : "",
      });
    }
  }, [open]);
  return {
    form,
  };
};

export default useFormCreate;
