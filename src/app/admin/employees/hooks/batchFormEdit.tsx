import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmployeesVo } from "../type";

const useFormCreate = ({
  editItem,
  open,
}: {
  editItem: EmployeesVo | null;
  open: boolean;
}) => {
  const FormSchema = z.object({
    license: z.string().optional(),
    hireDate: z.string().optional(),
    targetedHoursPerWeek: z.string().optional(),
    terminationDate: z.string().optional(),
    departmentIds: z.array(z.string()).optional(),
    roleIds: z.array(z.string()).optional(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      license: (editItem && editItem.license) || "",
      hireDate: (editItem && editItem.hireDate) || "",
      targetedHoursPerWeek: (editItem && editItem.targetedHoursPerWeek) || "",
      terminationDate: (editItem && editItem.terminationDate) || "",
      departmentIds: (editItem && editItem.departmentIds) || [],
      roleIds: (editItem && editItem.roleIds) || [],
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        license: (editItem && editItem.license) || "",
        hireDate: (editItem && editItem.hireDate) || "",
        targetedHoursPerWeek: (editItem && editItem.targetedHoursPerWeek) || "",
        terminationDate: (editItem && editItem.terminationDate) || "",
        departmentIds: (editItem && editItem.departmentIds) || [],
        roleIds: (editItem && editItem.roleIds) || [],
      });
    }
  }, [open, editItem]);
  return {
    form,
  };
};

export default useFormCreate;
