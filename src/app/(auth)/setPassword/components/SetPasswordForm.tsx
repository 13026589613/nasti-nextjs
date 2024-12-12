"use client";
import { cloneDeep } from "lodash";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { resetPasswoed } from "@/api/auth";
import Button from "@/components/custom/Button";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import PasswordInput from "@/components/custom/Input/password";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";
import { cn } from "@/lib/utils";
import Checked from "~/icons/Checked.svg";
import UnChecked from "~/icons/UnChecked.svg";

import { ResetPasswoedParams } from "../../types";
import useLoginFormHookCreate from "../hooks/setFormHook";
const SetForm = ({
  setLoading: setParentLoading,
}: {
  setLoading: (loading: boolean) => void;
}) => {
  const params = useSearchParams();

  const token = params.get("tokenId");
  const router = useRouter();
  const { form } = useLoginFormHookCreate();
  const [loading, setLoading] = useState(false);

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

  const submit = async (data: ResetPasswoedParams) => {
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
  };

  const resetPasswoedFn = async (data: ResetPasswoedParams) => {
    setParentLoading(true);
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
      setParentLoading(false);
    }
  };

  return (
    <div>
      <div className="w-full h-10 mt-[40px] leading-10 text-center text-[36px] font-[400]">
        {"Set Password"}
      </div>
      <div className="mt-[50px]">
        <CustomForm form={form} onSubmit={submit}>
          <div className="space-y-5">
            <>
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
                        className="h-12"
                        placeholder="Password"
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
                        <div
                          className="text-[#919FB4]"
                          style={{ marginLeft: 10 }}
                        >
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
                        className="h-12"
                        placeholder="Confirm Password"
                        {...field}
                      />
                    </div>
                  </CustomFormItem>
                )}
              />
            </>
          </div>
          <Button
            loading={loading}
            variant="default"
            className="w-full h-[66px] mt-[50px] text-[16px]"
          >
            Submit
          </Button>
        </CustomForm>
      </div>
    </div>
  );
};
export default SetForm;
