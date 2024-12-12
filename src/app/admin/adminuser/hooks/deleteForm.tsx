import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
/**
 * @description FormSchema for validation
 */
const FormSchema = z.object({
  terminationDate: z.string(),
});

/**
 * @description useFormCreate hook to handle form data and validation for create dictionary item
 * @param param0
 * @returns
 */
const useFormCreate = ({ open }: { open: boolean }) => {
  /**
   * @description useForm hook to handle form data and validation
   */
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
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
