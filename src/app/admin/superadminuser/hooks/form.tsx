import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { validateEmail } from "@/utils/verifyValidity";

import { UserVo } from "../types";
/**
 * @description FormSchema for validation
 */
const FormSchemaEdit = z.object({
  firstName: z.string().min(1, {
    message: "This field is required.",
  }),
  lastName: z.string().min(1, {
    message: "This field is required.",
  }),
  // nationalPhone: z.string().min(1, {
  //   message: "This field is required.",
  // }),
  // password: z.string().min(1, {
  //   message: "This field is required.",
  // }),

  email: z
    .string()
    .min(1, {
      message: "This field is required.",
    })
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

const FormSchemaAdd = z.object({
  email: z
    .string()
    .min(1, {
      message: "This field is required.",
    })
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
  firstName: z.string().min(1, {
    message: "This field is required.",
  }),
  lastName: z.string().min(1, {
    message: "This field is required.",
  }),
  // nationalPhone: z.string().min(1, {
  //   message: "This field is required.",
  // }),
  // password: z.string().min(1, {
  //   message: "This field is required.",
  // }),
  // isEnabled: z.string(),
});

export type AdminUserFormValuesEdit = z.infer<typeof FormSchemaEdit>;
export type AdminUserFormValuesAdd = z.infer<typeof FormSchemaAdd>;

/**
 * @description useFormCreate hook to handle form data and validation for create dictionary item
 * @param params
 * @returns
 */
const useFormCreate = ({
  editItem,
  open,
}: {
  editItem: UserVo | null;
  open: boolean;
}) => {
  /**
   * @description useForm hook to handle form data and validation
   */

  const form = useForm<z.infer<typeof FormSchemaEdit>>({
    resolver: zodResolver(FormSchemaEdit),
    defaultValues: {
      firstName: editItem ? editItem.firstName : "",
      lastName: editItem ? editItem.lastName : "",
      email: editItem ? editItem.email : "",
      // nationalPhone: editItem ? editItem.nationalPhone : "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        firstName: editItem ? editItem.firstName : "",
        lastName: editItem ? editItem.lastName : "",
        email: editItem ? editItem.email : "",
        // nationalPhone: editItem ? editItem.nationalPhone : "",
      });
    }
  }, [open]);
  return {
    form,
  };
};

export default useFormCreate;
