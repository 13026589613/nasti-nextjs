import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { validateEmail } from "@/utils/verifyValidity";

import { EmployeesVo } from "../type";
const useFormCreate = ({
  editItem,
  open,
  isAdd,
}: {
  editItem: EmployeesVo | null;
  open?: boolean;
  isAdd?: boolean;
}) => {
  const FormSchema = z.object({
    firstName: z
      .string({
        message: "This field is required.",
      })
      .min(1, {
        message: "This field is required.",
      }),
    lastName: z
      .string({
        message: "This field is required.",
      })
      .min(1, {
        message: "This field is required.",
      }),
    middleName: z.string().optional(),
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

    phone: z.string().min(1, {
      message: "Invalid phone number.",
    }),
    nationalPhone: z.string().min(1, {
      message: "Invalid phone number.",
    }),
    externalId: z.string().optional(),
    license: z.string().optional(),
    hireDate: z.string().min(1, {
      message: "This field is required.",
    }),
    targetedHoursPerWeek: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) {
            return true;
          }
          const emailRegex = /^\d*(\.\d*)?$/;
          return emailRegex.test(value);
        },
        {
          message: "This field is required.",
        }
      ),
    terminationDate: z.string().optional(),
    communityId: z.string().min(1, {
      message: "This field is required.",
    }),
    departmentIds: z.array(z.string()).optional(),
    workerRoleIds: z.array(z.string()).min(1, {
      message: "This field is required.",
    }),
  });

  const FormSchemaAdd = z.object({
    firstName: z.string().min(1, {
      message: "This field is required.",
    }),
    lastName: z.string().min(1, {
      message: "This field is required.",
    }),
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

    phone: z.string().optional(),
    nationalPhone: z.string().optional(),

    workerRoleIds: z.array(z.string()).min(1, {
      message: "This field is required.",
    }),
    communityId: z.string().min(1, {
      message: "This field is required.",
    }),
  });

  const fillNewForm = useMemo(() => {
    return {
      firstName: (editItem && editItem.firstName) || "",
      lastName: (editItem && editItem.lastName) || "",
      phone: (editItem && editItem.phone) || "",
      nationalPhone: (editItem && editItem.nationalPhone) || "",
      email: (editItem && editItem.email) || "",
      workerRoleIds: (editItem && editItem.workerRoleIds) || [],
      communityId: (editItem && editItem.userCommunityId) || "",
    };
  }, [editItem]);
  console.log(editItem?.departmentIds);

  const fillAllFrom = useMemo(() => {
    return {
      firstName: (editItem && editItem.firstName) || "",
      lastName: (editItem && editItem.lastName) || "",
      phone: (editItem && editItem.phone) || "",
      nationalPhone: (editItem && editItem.nationalPhone) || "",
      middleName: (editItem && editItem.middleName) || "",
      externalId: (editItem && editItem.externalId) || "",
      email: (editItem && editItem.email) || "",
      license: (editItem && editItem.license) || "",
      hireDate: (editItem && editItem.hireDate) || "",
      targetedHoursPerWeek: (editItem && editItem.targetedHoursPerWeek) || "",
      terminationDate: (editItem && editItem.terminationDate) || "",
      departmentIds: (editItem && editItem.departmentIds) || [],
      workerRoleIds: (editItem && editItem.workerRoleIds) || [],
      communityId: (editItem && editItem.userCommunityId) || "",
    };
  }, [editItem]);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: isAdd ? fillNewForm : fillAllFrom,
  });

  const formAdd = useForm<z.infer<typeof FormSchemaAdd>>({
    resolver: zodResolver(FormSchemaAdd),
    defaultValues: fillNewForm,
  });

  useEffect(() => {
    if (open) {
      form.reset(isAdd ? fillNewForm : fillAllFrom);
      formAdd.reset(fillNewForm);
    }
  }, [open, fillNewForm, fillAllFrom]);
  return {
    form,
    formAdd,
  };
};

export default useFormCreate;
