import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const useFormCreate = ({
  editItem,
  open,
}: {
  editItem: any | null;
  open: boolean;
}) => {
  const FormSchema = z.object({
    department: z.string().optional(),
    role: z.string().optional(),
    permission: z.string().optional(),
    date: z.string().min(1, {
      message: "This field is required.",
    }),
    content: z.string().min(1, {
      message: "This field is required.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      department: editItem ? editItem.department : "",
      role: editItem ? editItem.role : "",
      permission: editItem ? editItem.permission : "",
      date: editItem ? editItem.date : "",
      content: editItem ? editItem.content : "",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        department: editItem ? editItem.department : "",
        role: editItem ? editItem.role : "",
        permission: editItem ? editItem.permission : "",
        date: editItem ? editItem.date : "",
        content: editItem ? editItem.content : "",
      });
    }
  }, [open]);
  return {
    form,
  };
};

export default useFormCreate;
