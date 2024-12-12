import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

import { getUserInfoApi, loginApi } from "@/api/auth";
import Button from "@/components/custom/Button";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import PasswordInput from "@/components/custom/Input/password";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useDepartmentStore from "@/store/useDepartmentStore";
import useMenuNumStore from "@/store/useMenuNumStore";
import useTokenStore from "@/store/useTokenStore";
import useUserStore from "@/store/useUserStore";

import { LoginParams } from "../../types";
import useLoginFormHookCreate from "../hooks/loginFormHook";
const LoginForm = () => {
  const { form } = useLoginFormHookCreate();

  const type = useSearchParams().get("type");

  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const getUserInfo = async (token: string) => {
    const res = await getUserInfoApi(token);
    if (res.code === 200) {
      useUserStore.getState().setUserInfo({
        id: res.data.id,
        email: res.data.email,
        phone: res.data.phone,
        isEnabled: res.data.isEnabled,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        middleName: res.data.middleName,
        portraitFileId: res.data.portraitFileId,
        nationalPhone: res.data.nationalPhone,
      });

      useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);

      const { isSuperAdmin } = useTokenStore.getState();

      if (isSuperAdmin) {
        router.push("/admin/company");
        return;
      }

      if (type === "isOnboarding") {
        router.push("/register?tokenId=isOnboarding");
      } else {
        if (!res.data.operateCommunity) {
          router.push("/register?tokenId=isOnboarding");
        } else {
          if (res.data.operateCommunity?.isConfirmed) {
            router.push("/currentSchedule");
          } else {
            router.push("/myCommunity");
          }
        }
      }
    }
  };

  const login = async (params: LoginParams) => {
    try {
      const data = await loginApi(params);
      if (data.code === 200) {
        useTokenStore.getState().setAccessToken(data.data.token);
        useTokenStore.getState().setUserRole(data?.data?.role);

        useAppStore.getState().reSetAppStore();
        useDepartmentStore.getState().resetStore();

        await getUserInfo(data.data.token);
      }
    } catch (error) {
      toast.error(MESSAGE.loginError, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <CustomForm
      form={form}
      onSubmit={(data) => {
        setLoading(true);
        login({
          username: data.email,
          password: data.password,
        });
      }}
    >
      <div className="space-y-10">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <CustomFormItem formMessageClassName="absolute">
              <div className={cn("w-full")}>
                <Input
                  prefix="UserIcon"
                  className="h-12"
                  placeholder="Email"
                  {...field}
                />
              </div>
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <CustomFormItem formMessageClassName="absolute">
              <div className={cn("w-full")}>
                <PasswordInput
                  prefix="LockIcon"
                  className="h-12"
                  placeholder="Password"
                  {...field}
                />
              </div>
            </CustomFormItem>
          )}
        />
      </div>
      <div className="flex justify-end">
        <Link href="/forgotPassword">
          <div className="h-10 leading-10 mt-[17px] text-[16px] text-[#F5894E] text-right cursor-pointer">
            Forgot Password?
          </div>
        </Link>
      </div>
      <Button
        loading={loading}
        variant="default"
        className="w-full h-[66px] mt-[29px] text-[16px]"
      >
        Sign In
      </Button>
      <ConfirmDialog
        title="Login successfully"
        open={dialogOpen}
        okText="Create a New Community"
        cancelText="Cancel"
        onClose={() => {
          setDialogOpen(false);
        }}
        onOk={() => {
          setDialogOpen(false);
          router.replace("/onboarding/community");
        }}
      >
        Waiting for approval from the community administrator
      </ConfirmDialog>
    </CustomForm>
  );
};
export default LoginForm;
