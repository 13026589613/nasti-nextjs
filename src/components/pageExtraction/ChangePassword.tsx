"use client";
import { cloneDeep } from "lodash";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { userChangePassword } from "@/api/user";
import { UserChangePasswordReq } from "@/api/user/types";
import Button from "@/components/custom/Button";
import useAppStore from "@/store/useAppStore";
import useDepartmentStore from "@/store/useDepartmentStore";
import useTokenStore from "@/store/useTokenStore";
import { cancelAllRequests } from "@/utils/http";
import Checked from "~/icons/Checked.svg";
import UnChecked from "~/icons/UnChecked.svg";

import PasswordInput from "../custom/Input/password";
import { FormItem, FormLabel } from "../FormComponent";
import PageTitle from "../PageTitle";

interface FormValuesType extends UserChangePasswordReq {
  confirmPassword: string;
  must: string;
}

const ChangePassword = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

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
    control,
    formState: { errors },
    setError,
    handleSubmit,
  } = useForm<FormValuesType>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

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

  const onSubmit = (formData: FormValuesType) => {
    const { oldPassword, newPassword, confirmPassword } = formData;

    if (newPassword !== confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match.",
      });
      return;
    }

    setIsLoading(true);

    userChangePassword({
      oldPassword,
      newPassword,
    })
      .then(({ code, message }) => {
        if (code !== 200) {
          if (message === "The original password is incorrect!") {
            setError("oldPassword", {
              type: "manual",
              message: "The current password is incorrect.",
            });
          } else {
            toast.error(message, {
              position: "top-center",
            });
          }

          return;
        }

        toast.warning("Password changed successfully, please log in again.", {
          position: "top-center",
        });

        handleLogout();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleLogout = () => {
    router.push("/login");
    cancelAllRequests();
    useTokenStore.getState().logout();
    // clear store after router push
    setTimeout(() => {
      useAppStore.getState().reSetAppStore();
      useDepartmentStore.getState().resetStore();
    }, 100);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <PageTitle title="Change Password" isClose={false} />

        <FormLabel label="Current Password" required className="mt-[20px]">
          <FormItem
            className="max-w-[776px]"
            name="oldPassword"
            control={control}
            errors={errors.oldPassword}
            render={({ field: { value, onChange } }) => (
              <PasswordInput
                placeholder="Current Password"
                value={value}
                type="password"
                onChange={onChange}
              />
            )}
            rules={{
              required: "This field is required.",
            }}
          />
        </FormLabel>

        <FormLabel label="New Password" required>
          <FormItem
            className="max-w-[776px]"
            name="newPassword"
            control={control}
            errors={errors.newPassword}
            render={({ field: { value, onChange } }) => (
              <PasswordInput
                placeholder="New Password"
                value={value}
                onChange={(e) => {
                  onChange(e);
                  handleVerifyPassword(e.target.value);
                }}
              />
            )}
            rules={{
              required: "This field is required.",
              pattern:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\^$*.[\]{}()\-“!@#%&/,><’:;|_~`])[A-Za-z\d\\^$*.[\]{}()\-“!@#%&/,><’:;|_~`]{8,20}$/,
            }}
          />
        </FormLabel>

        <FormLabel className="mt-[-14px] ml-8" label="Password must:">
          <FormItem
            name="must"
            control={control}
            render={() => {
              return (
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
              );
            }}
          />
        </FormLabel>

        <FormLabel label="Confirm New Password" required>
          <FormItem
            className="max-w-[776px]"
            name="confirmPassword"
            control={control}
            errors={errors.confirmPassword}
            render={({ field: { value, onChange } }) => (
              <PasswordInput
                placeholder="Confirm New Password"
                value={value}
                onChange={onChange}
              />
            )}
            rules={{
              required: "This field is required.",
            }}
          />
        </FormLabel>
      </div>

      <div className="flex justify-end p-[0_30px_30px_0]">
        <Button
          className="mr-[20px] w-[160px]"
          type="button"
          disabled={isLoading}
          variant="outline"
          onClick={() => {
            router.back();
          }}
        >
          Cancel
        </Button>

        <Button
          className="w-[160px]"
          type="button"
          loading={isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default ChangePassword;
