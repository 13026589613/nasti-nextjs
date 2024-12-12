import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { validateEmail } from "@/utils/verifyValidity";
interface UseLoginFormHookCreateProps {
  type: "email" | "password" | "info";
}
const FormSchema_Info = z.object({
  firstName: z.string().min(1, {
    message: "This field is required.",
  }),
  lastName: z.string().min(1, {
    message: "This field is required.",
  }),

  nationalPhone: z.string().min(1, {
    message: "This field is required.",
  }),

  title: z.string().min(1, {
    message: "This field is required.",
  }),
  companyId: z.string().min(1, {
    message: "This field is required.",
  }),
  communityId: z.string().min(1, {
    message: "This field is required.",
  }),
});
const FormSchema_Info_without = z.object({
  firstName: z.string().min(1, {
    message: "This field is required.",
  }),
  lastName: z.string().min(1, {
    message: "This field is required.",
  }),
  nationalPhone: z.string().min(1, {
    message: "This field is required.",
  }),

  title: z.string().min(1, {
    message: "This field is required.",
  }),
});
export type InfoFormType = z.infer<typeof FormSchema_Info>;
const useRegisterFormHookCreate = ({ type }: UseLoginFormHookCreateProps) => {
  const params = useSearchParams();
  const isINVITE = params.get("type");
  const FormSchema_Email = z.object({
    email: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) {
            return true;
          }
          return validateEmail(value);
        },
        {
          message: "Invalid email address.",
        }
      ),
  });

  const form_email = useForm<z.infer<typeof FormSchema_Email>>({
    resolver: zodResolver(FormSchema_Email),
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
  });

  const form_info = useForm<z.infer<typeof FormSchema_Info>>({
    resolver: zodResolver(FormSchema_Info),
  });

  const form_info_without = useForm<z.infer<typeof FormSchema_Info_without>>({
    resolver: zodResolver(FormSchema_Info_without),
  });

  let form: any = type === "email" ? form_email : form_password;
  if (type === "info") {
    form = form_info;
    if (isINVITE === "INVITE") {
      form = form_info_without;
    }
  }

  return {
    form,
  };
};

export default useRegisterFormHookCreate;
