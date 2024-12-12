import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PbjJobVo } from "../types";

const useFormCreate = ({
  editItem,
  open,
  categoryName,
}: {
  editItem: PbjJobVo | null;
  open: boolean;
  categoryName: string;
}) => {
  const FormSchema = z.object({
    code: z.string().min(1, {
      message: "This field is required.",
    }),
    name: z.string().min(1, {
      message: "This field is required.",
    }),
    categoryName: z.string().min(1, {
      message: "This field is required.",
    }),
    categoryCode: z.string().min(1, {
      message: "This field is required.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: editItem ? editItem.code : "",
      name: editItem ? editItem.name : "",
      categoryName: editItem ? editItem.categoryName : "",
      categoryCode: editItem ? editItem.id : "",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        code: editItem ? editItem.code : "",
        name: editItem ? editItem.name : "",
        categoryName: editItem ? editItem.categoryName : "",
        categoryCode: editItem ? editItem.categoryId : "",
      });
    }
  }, [open]);
  return {
    form,
  };
};

export default useFormCreate;
