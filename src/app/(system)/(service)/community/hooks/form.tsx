import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CommunityVo } from "../types";

/**
 * @description useFormCreate hook to handle form data and validation for create dictionary item
 * @param param0
 * @returns
 */
const useFormCreate = ({
  editItem,
  open,
}: {
  editItem: CommunityVo | null;
  open: boolean;
}) => {
  /**
   * @description FormSchema for validation
   */
  const FormSchema = z.object({
    name: z.string().min(1, {
      message: "This field is required.",
    }),
    startOfWeek: z.string().min(1, {
      message: "This field is required.",
    }),
    physicalAddress: z.string().min(1, {
      message: "This field is required.",
    }),
    physicalCity: z.string().min(1, {
      message: "This field is required.",
    }),
    physicalState: z.string().min(1, {
      message: "This field is required.",
    }),
    physicalZip: z.string().min(1, {
      message: "This field is required.",
    }),
    mailingAddress: z.string().min(1, {
      message: "This field is required.",
    }),
    mailingCity: z.string().min(1, {
      message: "This field is required.",
    }),
    mailingState: z.string().min(1, {
      message: "This field is required.",
    }),
    mailingZip: z.string().min(1, {
      message: "This field is required.",
    }),
    billingContact: z.string().min(1, {
      message: "This field is required.",
    }),
    billingEmail: z.string().min(1, {
      message: "This field is required.",
    }),
    attendanceEnabled: z.string().min(1, {
      message: "This field is required.",
    }),
    locationLat: z.string().min(1, {
      message: "This field is required.",
    }),
    locationLng: z.string().min(1, {
      message: "This field is required.",
    }),
  });

  /**
   * @description useForm hook to handle form data and validation
   */
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: editItem ? editItem.name : "",
      startOfWeek: editItem ? editItem.startOfWeek : "",
      physicalAddress: editItem ? editItem.physicalAddress : "",
      physicalCity: editItem ? editItem.physicalCity : "",
      physicalState: editItem ? editItem.physicalState : "",
      physicalZip: editItem ? editItem.physicalZip : "",
      mailingAddress: editItem ? editItem.mailingAddress : "",
      mailingCity: editItem ? editItem.mailingCity : "",
      mailingState: editItem ? editItem.mailingState : "",
      mailingZip: editItem ? editItem.mailingZip : "",
      billingContact: editItem ? editItem.billingContact : "",
      billingEmail: editItem ? editItem.billingEmail : "",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        name: editItem ? editItem.name : "",
        startOfWeek: editItem ? editItem.startOfWeek : "",
        physicalAddress: editItem ? editItem.physicalAddress : "",
        physicalCity: editItem ? editItem.physicalCity : "",
        physicalState: editItem ? editItem.physicalState : "",
        physicalZip: editItem ? editItem.physicalZip : "",
        mailingAddress: editItem ? editItem.mailingAddress : "",
        mailingCity: editItem ? editItem.mailingCity : "",
        mailingState: editItem ? editItem.mailingState : "",
        mailingZip: editItem ? editItem.mailingZip : "",
        billingContact: editItem ? editItem.billingContact : "",
        billingEmail: editItem ? editItem.billingEmail : "",
      });
    }
  }, [open]);
  return {
    form,
  };
};

export default useFormCreate;
