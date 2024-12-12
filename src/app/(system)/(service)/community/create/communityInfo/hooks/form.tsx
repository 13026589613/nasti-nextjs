import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const regex = /^(0[1-9]|[1-9][0-9]|[1-9][0-9]{2})[0-9]{3}([0-9]{4})?$/;
const FormSchema = z.object({
  name: z.string().min(1, {
    message: "This field is required.",
  }),
  companyId: z.string().min(1, {
    message: "This field is required.",
  }),
  buildingTypeList: z.array(z.string()).min(1, {
    message: "This field is required.",
  }),
  logoFileId: z.string().optional().nullable(),
  physicalAddress: z.string().min(1, {
    message: "This field is required.",
  }),
  physicalCity: z.string().min(1, {
    message: "This field is required.",
  }),
  physicalState: z.string().min(1, {
    message: "This field is required.",
  }),
  physicalZip: z
    .string()
    .min(1, {
      message: "This field is required.",
    })
    .regex(regex),
  mailingAddress: z.string(),
  mailingAddress2: z.string(),
  mailingCity: z.string(),
  mailingState: z.string().optional().nullable(),
  mailingZip: z.string().refine((value) => {
    if (value && isNaN(Number(value))) {
      return false;
    } else {
      return true;
    }
  }),
  billingEmail: z.string().refine(
    (value) => {
      if (!value) {
        return true;
      }
      const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
      return emailRegex.test(value);
    },
    {
      message: "Invalid email address",
    }
  ),
  billingContact: z.string(),
  startOfWeek: z.string().min(1, {
    message: "This field is required.",
  }),
  attendanceEnabled: z.boolean(),
  timeZoneId: z.string(),
});

export type AddressInfoType = {
  physicalAddress: string;
  physicalCity: string;
  physicalState: string;
  physicalZip: string;
  info: string;
  lat: number;
  lng: number;
};

export type FormType = z.infer<typeof FormSchema>;
const useFormCreate = ({
  editItem,
  open,
}: {
  editItem?: any;
  open?: boolean;
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: editItem ? editItem.name : "",
      companyId: editItem ? editItem.companyId : "",
      buildingTypeList: editItem ? editItem.buildingTypeList : [],
      logoFileId: editItem ? editItem.logoFileId : "",
      physicalAddress: editItem ? editItem.physicalAddress : "",
      physicalCity: editItem ? editItem.physicalCity : "",
      physicalState: editItem ? editItem.physicalState : "",
      physicalZip: editItem ? editItem.physicalZip : "",
      mailingAddress: editItem ? editItem.mailingAddress : "",
      mailingAddress2: editItem ? editItem.mailingAddress2 : "",
      mailingCity: editItem ? editItem.mailingCity : "",
      mailingState: editItem ? editItem.mailingState : "",
      mailingZip: editItem ? editItem.mailingZip : "",
      billingEmail: editItem ? editItem.billingEmail : "",
      billingContact: editItem ? editItem.billingContact : "",
      startOfWeek: editItem ? editItem.startOfWeek : "SUNDAY",
      attendanceEnabled: editItem ? editItem.attendanceEnabled : true,
      timeZoneId: editItem ? editItem.timeZoneId : "",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        name: editItem ? editItem.name : "",
      });
    }
  }, [open]);
  return {
    form,
  };
};

export default useFormCreate;
