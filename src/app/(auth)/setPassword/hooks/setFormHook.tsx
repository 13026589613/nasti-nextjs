import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const useSetPasswordFormHookCreate = () => {
  const FormSchema_Password = z.object({
    password: z
      .string()
      .min(1, {
        message: "This field is required.",
      })
      .refine(
        (value) => {
          if (!value) {
            return true;
          }
          const password =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\^$*.[\]{}()\-“!@#%&/,><’:;|_~`])[A-Za-z\d\\^$*.[\]{}()\-“!@#%&/,><’:;|_~`]{8,20}$/;
          return password.test(value);
        },
        { message: "Password must be between 8 and 20 characters." }
      ),
    confirmPassword: z.string().min(1, {
      message: "This field is required.",
    }),
    // .refine(
    //   (value) => {
    //     if (!value) {
    //       return true;
    //     }
    //     const password =
    //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\^$*.[\]{}()\-“!@#%&/,><’:;|_~`])[A-Za-z\d\\^$*.[\]{}()\-“!@#%&/,><’:;|_~`]{8,20}$/;
    //     return password.test(value);
    //   },
    //   { message: "Password must be between 8 and 20 characters." }
    // ),
  });
  const form_password = useForm<z.infer<typeof FormSchema_Password>>({
    resolver: zodResolver(FormSchema_Password),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  return {
    form: form_password,
  };
};

export default useSetPasswordFormHookCreate;
