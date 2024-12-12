"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { toast } from "react-toastify";

import { sendEmailForForgotPasswoed } from "@/api/auth";
import Button from "@/components/custom/Button";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";
import { SEND_EMAIL_TYPE } from "@/constant/authConstants";
import { MESSAGE } from "@/constant/message";
import { cn } from "@/lib/utils";

import { SendEmailForForgotPasswoedParams } from "../../types";
import useRegisterFormHookCreate from "../hooks/RegisterFormHook";

interface Props {
  setType: (type: "email" | "password" | "info" | "hasSendEmail") => void;
  setSendEmail: (email: string | null) => void;
  setEmailSame: (emailSame: boolean) => void;
}
const RegisterEmailForm = (props: Props, ref: any) => {
  const { setType, setSendEmail, setEmailSame } = props;

  const [loading, setLoading] = useState(false);

  const { form } = useRegisterFormHookCreate({
    type: "email",
  });

  const sendEmail = async (data: SendEmailForForgotPasswoedParams) => {
    try {
      const res = await sendEmailForForgotPasswoed(data);
      if (res.code === 200) {
        toast.success(MESSAGE.sendEmail, { position: "top-center" });
        setType("email");
        setSendEmail(data.email);
      } else {
        setSendEmail(null);
        if (res.code === 400) {
          setEmailSame(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = (data: { email: string }) => {
    handleSubmit(data);
  };

  const handleSubmit = (data: { email: string }) => {
    setLoading(true);
    sendEmail({
      email: data.email,
      type: SEND_EMAIL_TYPE.REGISTRATION,
      redirectUrl: window.location.href,
    });
  };

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  return (
    <CustomForm form={form} onSubmit={submit}>
      <div className="space-y-3">
        <FormField
          control={form.control as any}
          name="email"
          render={({ field }) => (
            <CustomFormItem
              label={"Email Address"}
              formMessageClassName="absolute bottom-[-25px]"
              required
            >
              <div className={cn("w-full")}>
                <Input
                  suffix="EmailIcon"
                  className="h-12"
                  placeholder="Email Address"
                  {...field}
                />
              </div>
            </CustomFormItem>
          )}
        />
      </div>
      <Button
        loading={loading}
        variant="default"
        className="w-full h-[66px] mt-[50px] text-[16px]"
      >
        Submit
      </Button>
    </CustomForm>
  );
};
export default forwardRef(RegisterEmailForm);
