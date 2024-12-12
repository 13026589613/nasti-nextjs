import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DictinaryVo } from "../type";

const useFormCreate = ({
  editItem,
  open,
}: {
  editItem: DictinaryVo | null;
  open: boolean;
}) => {
  const FormSchema = z.object({
    description: z.string().min(1, {
      message: "This field is required.",
    }),
    code: z.string().min(1, {
      message: "This field is required.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: editItem ? editItem.description : "",
      code: editItem ? editItem.code : "",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        description: editItem ? editItem.description : "",
        code: editItem ? editItem.code : "",
      });
    }
  }, [open]);
  return {
    form,
  };
};

export default useFormCreate;
