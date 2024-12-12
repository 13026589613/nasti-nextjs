import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { validateEmail } from "@/utils/verifyValidity";

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
  nationalPhone: z.string().min(1, {
    message: "This field is required.",
  }),

  communityId: z.string().min(1, {
    message: "This field is required.",
  }),

  title: z.string(),
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
  departmentIds: z
    .array(z.string())
    .nonempty({ message: "This field is required." }),
});

const FormSchemaAdd = z.object({
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
  communityId: z.string().min(1, {
    message: "This field is required.",
  }),

  departmentIds: z
    .array(z.string())
    .nonempty({ message: "This field is required." }),
});

export type AdminUserFormValuesEdit = z.infer<typeof FormSchemaEdit>;
export type AdminUserFormValuesAdd = z.infer<typeof FormSchemaAdd>;

/**
 * @description useFormCreate hook to handle form data and validation for create dictionary item
 * @param param0
 * @returns
 */
const useFormCreate = ({
  open,
  isShowMore,
}: {
  open: boolean;
  isShowMore: boolean;
}) => {
  /**
   * @description useForm hook to handle form data and validation
   */
  const formEdit = useForm<z.infer<typeof FormSchemaEdit>>({
    resolver: zodResolver(FormSchemaEdit),
    defaultValues: {
      firstName: "",
      lastName: "",
      nationalPhone: "",
      title: "",
      email: "",
      communityId: "",
      departmentIds: [],
    },
  });

  const formAdd = useForm<z.infer<typeof FormSchemaAdd>>({
    resolver: zodResolver(FormSchemaAdd),
    defaultValues: {
      email: "",
      communityId: "",
      departmentIds: [],
    },
  });
  useEffect(() => {
    if (open) {
      formAdd.reset();
      formEdit.reset();
    }
  }, [open]);
  return {
    form: isShowMore ? formEdit : formAdd,
  };
};

export default useFormCreate;
