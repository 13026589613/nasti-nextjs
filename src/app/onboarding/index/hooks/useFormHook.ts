import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const useFormCreate = ({ open }: { open: boolean }) => {
  const FormSchema = z.object({
    communityId: z.string().min(1, {
      message: "This field is required.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      communityId: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open]);

  return {
    form,
  };
};

export default useFormCreate;
