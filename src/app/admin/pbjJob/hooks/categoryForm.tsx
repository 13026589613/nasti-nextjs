import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { RowList } from "../components/AddCategory";
const useFormCategoryCreate = ({
  open,
  editItem,
}: {
  open: boolean;
  categoryList: RowList[];
  editItem: any | null;
}) => {
  const itemSchema = z.object({
    code: z.string().min(1, {
      message: "This field is required.",
    }),
    name: z.string().min(1, {
      message: "This field is required.",
    }),
  });

  const FormSchema = z.object({
    name: z.string().min(1, {
      message: "This field is required.",
    }),
    categoryList: z
      .array(itemSchema)
      .nonempty({ message: "This field is required." }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: editItem ? editItem.name : "",
      categoryList: editItem ? editItem?.rowList : [{ code: "", name: "" }],
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        name: editItem ? editItem.name : "",
        categoryList: editItem ? editItem?.rowList : [{ code: "", name: "" }],
      });
    }
  }, [open, editItem]);
  return {
    form,
  };
};

export default useFormCategoryCreate;
