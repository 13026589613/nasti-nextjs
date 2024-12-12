import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const useLoginFormHookCreate = () => {
  const FormSchema = z.object({
    email: z.string().min(1, {
      message: "Please input your email.",
    }),
    password: z.string().min(1, {
      message: "Please input your password.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return {
    form,
  };
};

export default useLoginFormHookCreate;
