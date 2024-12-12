import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
interface UseLoginFormHookCreateProps {
  type: "email" | "password";
}

const useLoginFormHookCreate = ({ type }: UseLoginFormHookCreateProps) => {
  const FormSchema_Email = z.object({
    email: z
      .string()
      .min(1, {
        message: "Please input your email.",
      })
      .email({
        message: "Please input a valid email.",
      }),
  });

  const form_email = useForm<z.infer<typeof FormSchema_Email>>({
    resolver: zodResolver(FormSchema_Email),
    defaultValues: {
      email: "",
    },
  });

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
        { message: "" }
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
    //   { message: "" }
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
    form: type === "email" ? form_email : form_password,
  };
};

export default useLoginFormHookCreate;
