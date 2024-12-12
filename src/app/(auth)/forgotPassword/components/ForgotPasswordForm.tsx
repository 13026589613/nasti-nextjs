"use client";
import { cloneDeep } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  resetPasswoed,
  sendEmailForForgotPasswoed,
  validateForgotPasswordEmail,
} from "@/api/auth";
import { resetPasswoedVerify } from "@/api/auth/index";
import Button from "@/components/custom/Button";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import PasswordInput from "@/components/custom/Input/password";
import { FormField } from "@/components/ui/form";
import { SEND_EMAIL_TYPE } from "@/constant/authConstants";
import { MESSAGE } from "@/constant/message";
import { cn } from "@/lib/utils";
import Checked from "~/icons/Checked.svg";
import UnChecked from "~/icons/UnChecked.svg";

import {
  ResetPasswoedParams,
  SendEmailForForgotPasswoedParams,
} from "../../types";
import useLoginFormHookCreate from "../hooks/forgotFormHook";
import { ForgotPasswordFormType } from "../type";
const ForgotForm = ({
  setLoading: setParentLoading,
}: {
  setLoading: (loading: boolean) => void;
}) => {
  const params = useSearchParams();
  const token = params.get("tokenId");
  const router = useRouter();
  const { form } = useLoginFormHookCreate({
    type: token ? "password" : "email",
  });
  const [loading, setLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [hasSendEmail, setHasSendEmail] = useState(false);

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

  const {
    formState: { errors },
  } = form;

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
  const sendEmail = async (data: SendEmailForForgotPasswoedParams) => {
    setLoading(true);
    try {
      const res = await resetPasswoedVerify({ email: data.email });
      if (res.code === 200 && res.data) {
        const res = await sendEmailForForgotPasswoed(data);
        if (res.code === 200) {
          setHasSendEmail(true);
          toast.success(MESSAGE.sendEmail, { position: "top-center" });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = async () => {
    // setParentLoading(true);
    try {
      const res = await validateForgotPasswordEmail({
        token: token as string,
      });
      if (res.code === 200) {
        setIsEmailValid(true);
      } else {
        router.push("/forgotPassword");
      }
    } finally {
      setLoading(false);
      setParentLoading(false);
    }
  };

  const resetPasswoedFn = async (data: ResetPasswoedParams) => {
    try {
      const res = await resetPasswoed({
        tokenId: data.tokenId,
        password: data.password,
      });
      if (res.code === 200) {
        toast.success(MESSAGE.resetPassword, {
          position: "top-center",
        });
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = (data: ForgotPasswordFormType) => {
    setLoading(true);
    if ("email" in data) {
      sendEmail({
        email: data.email,
        type: SEND_EMAIL_TYPE.RESET,
        redirectUrl: location.href,
      });
    } else {
      const nowData: any = data;

      if (nowData?.password !== nowData?.confirmPassword) {
        setLoading(false);
        toast.error(MESSAGE.passwordNotMatch, {
          position: "top-center",
        });
      } else {
        resetPasswoedFn({
          password: nowData.password,
          tokenId: token as string,
        });
      }
    }
  };

  useEffect(() => {
    if (token) {
      validateEmail();
    }
  }, []);

  return (
    <div>
      <div className="w-full h-10 mt-[40px] leading-10 text-center text-[36px] font-[400]">
        {hasSendEmail || token ? "Reset Password" : "Forgot Password"}
      </div>
      <div className="mt-[50px]">
        <CustomForm form={form} onSubmit={submit}>
          <div className="space-y-5">
            {token && (
              <>
                <FormField
                  control={form.control as any}
                  name="password"
                  render={({ field }) => (
                    <CustomFormItem
                      label={"New Password"}
                      formMessageClassName="absolute"
                      required
                    >
                      <div className={cn("w-full")}>
                        <PasswordInput
                          suffix="EmailIcon"
                          className={`h-12 ${
                            // @ts-ignore
                            errors.password ? "border-[#ec4899]" : ""
                          }`}
                          placeholder="New Password"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            handleVerifyPassword(e.target.value);
                          }}
                        />
                      </div>
                    </CustomFormItem>
                  )}
                />

                <CustomFormItem
                  label={"Password must:"}
                  required
                  className="ml-2 mb-4"
                >
                  {passwordVerifyList.map(({ text, state }) => {
                    const isDefault = state === 1;
                    const isSuccess = state === 2;
                    return (
                      <div
                        key={text}
                        className="flex justify-start items-center mt-[5px]"
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
                        <div
                          className="text-[#919FB4]"
                          style={{ marginLeft: 10 }}
                        >
                          {text}
                        </div>
                      </div>
                    );
                  })}
                </CustomFormItem>

                <FormField
                  control={form.control as any}
                  name="confirmPassword"
                  render={({ field }) => (
                    <CustomFormItem
                      label={"Confirm New Password"}
                      formMessageClassName="absolute"
                      required
                    >
                      <div className={cn("w-full")}>
                        <PasswordInput
                          suffix="EmailIcon"
                          className={`h-12 ${
                            // @ts-ignore
                            errors.confirmPassword ? "border-[#ec4899]" : ""
                          }`}
                          placeholder="Confirm New Password"
                          {...field}
                        />
                      </div>
                    </CustomFormItem>
                  )}
                />
              </>
            )}

            {/* Email Input */}
            {!token && !hasSendEmail ? (
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
            ) : null}
          </div>

          {/* Email Submit  */}
          {!token && !hasSendEmail ? (
            <>
              <Button
                loading={loading}
                variant="default"
                className="w-full h-[66px] mt-[50px] text-[16px]"
              >
                Submit
              </Button>
            </>
          ) : null}

          {/* Email HasSend Title  */}
          {!token && hasSendEmail ? (
            <div className="w-full h-10 leading-10 text-[16px] font-[390] text-[rgba(0, 0, 0, 0.45)] ">
              <div>
                Check your inbox ({(form as any).getValues("email")}) for a link
                to reset your password.
              </div>
              Did not receive the verification email? Please{" "}
              <Button
                disabled={loading}
                variant="link"
                className="text-[#EB1DB2] cursor-pointer p-0 leading-10 text-[16px] font-[390] "
              >
                resend
              </Button>
              {"."}
            </div>
          ) : null}

          {token && (
            <div className="flex justify-end mt-[31px]">
              <Button
                loading={loading}
                disabled={!isEmailValid}
                variant="default"
                className="min-w-[149px] h-[48px] font-[390] text-[16px]"
              >
                Reset Password
              </Button>
            </div>
          )}
        </CustomForm>
      </div>
    </div>
  );
};
export default ForgotForm;
