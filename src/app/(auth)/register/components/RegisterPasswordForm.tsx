"use client";
import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Button from "@/components/custom/Button";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import PasswordInput from "@/components/custom/Input/password";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";
import { cn } from "@/lib/utils";
import Checked from "~/icons/Checked.svg";
import UnChecked from "~/icons/UnChecked.svg";

import useRegisterFormHookCreate from "../hooks/RegisterFormHook";
import { PasswordData } from "../types";
interface RegisterPasswordFormProps {
  passwordData: PasswordData | null;
  setPasswordData: (data: PasswordData | null) => void;
  setType: (type: "email" | "password" | "info") => void;
}
// import { ForgotPasswordFormType } from "../type";
const RegisterPasswordForm = (props: RegisterPasswordFormProps) => {
  const { passwordData, setPasswordData, setType } = props;
  const { form } = useRegisterFormHookCreate({
    type: "password",
  });

  const {
    formState: { errors },
  } = form;

  const password = form.watch("password");

  const [passwordVerifyList, setPasswordVerifyList] = useState([
    {
      text: "Be between 8 and 20 characters.",
      /*
        1: default,
        2: success,
      */
      state: 1,
    },
    {
      text: "Contain at least one uppercase character.",
      state: 1,
    },
    {
      text: "Contain at least one lowercase character.",
      state: 1,
    },
    {
      text: "Contain at least one special character.",
      state: 1,
    },
    {
      text: "Contain at least one number.",
      state: 1,
    },
  ]);

  const handleVerifyPassword = (text: string) => {
    const newPasswordVerifyList = cloneDeep(passwordVerifyList);
    newPasswordVerifyList.forEach((item) => (item.state = 1));
    if (text) {
      const isPassLength = text.match(/^.{8,20}$/);
      const isPassUppercase = text.match(/[A-Z]/);
      const isPassLowercase = text.match(/[a-z]/);
      const isSpecial = text.match(/[\^$*.[\]{}()\-“!@#%&/,><’:;|_~`]/);
      const isPassNumber = text.match(/\d/);

      const isPassList = [
        !!isPassLength,
        !!isPassUppercase,
        !!isPassLowercase,
        !!isSpecial,
        !!isPassNumber,
      ];

      newPasswordVerifyList.forEach((item, index) => {
        item.state = isPassList[index] ? 2 : 1;
      });
    }
    setPasswordVerifyList(newPasswordVerifyList);
  };

  const submit = (data: PasswordData) => {
    if (data.confirmPassword != data.password) {
      toast.warning(MESSAGE.passwordNotMatch, {
        position: "top-center",
      });
    } else {
      setPasswordData(data);
      setType("info");
    }
  };

  useEffect(() => {
    if (passwordData) {
      form.reset({
        ...passwordData,
      });
    }
  }, [passwordData]);

  useEffect(() => {
    handleVerifyPassword(form.getValues("password"));
  }, [password]);

  return (
    <CustomForm form={form} onSubmit={submit}>
      <div className="space-y-5">
        <FormField
          control={form.control as any}
          name="password"
          render={({ field }) => (
            <CustomFormItem
              label={"Password"}
              formMessageClassName="absolute"
              required
            >
              <div className={cn("w-full")}>
                <PasswordInput
                  suffix="EmailIcon"
                  className={`h-12 ${
                    errors.password ? "border-[#ec4899]" : ""
                  }`}
                  placeholder="Password"
                  {...field}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              </div>
            </CustomFormItem>
          )}
        />

        <CustomFormItem
          label={"Password must:"}
          formMessageClassName="absolute"
          className="mt-[-14px] ml-8"
        >
          <div className="mt-[-10px]">
            {passwordVerifyList.map(({ text, state }) => {
              const isDefault = state === 1;
              const isSuccess = state === 2;
              return (
                <div
                  key={text}
                  className="flex justify-start items-center mt-[14px]"
                >
                  {isSuccess ? (
                    <Checked icon="Checked" color="#E4E4E7" size={15} />
                  ) : (
                    <UnChecked
                      icon="Checked"
                      color={isDefault ? "#EB1DB2" : "#E4E4E7"}
                      size={15}
                    />
                  )}
                  <div className="text-[#919FB4]" style={{ marginLeft: 10 }}>
                    {text}
                  </div>
                </div>
              );
            })}
          </div>
        </CustomFormItem>

        <FormField
          control={form.control as any}
          name="confirmPassword"
          render={({ field }) => (
            <CustomFormItem
              label={"Confirm Password"}
              formMessageClassName="absolute"
              required
            >
              <div className={cn("w-full")}>
                <PasswordInput
                  suffix="EmailIcon"
                  className={`h-12 ${
                    errors.confirmPassword ? "border-[#ec4899]" : ""
                  }`}
                  placeholder="Confirm Password"
                  {...field}
                />
              </div>
            </CustomFormItem>
          )}
        />
      </div>
      <div className="flex justify-end mt-[31px]">
        <Button
          type="submit"
          variant="default"
          className="w-[149px] h-[48px] font-[390] text-[16px]"
        >
          Next
        </Button>
      </div>
    </CustomForm>
  );
};
export default RegisterPasswordForm;
