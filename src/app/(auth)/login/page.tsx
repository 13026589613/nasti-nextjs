"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { inviteConfirmApi, validateForgotPasswordEmail } from "@/api/auth";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import { MESSAGE } from "@/constant/message";
import useAppStore from "@/store/useAppStore";

import LoginForm from "./components/Loginform";
import LoginTabs from "./components/tab";

const Login = () => {
  const [type, setType] = useState<string>("nasti");
  const searchParams = useSearchParams();
  const communityName = searchParams.get("communityName");
  const [confirmDia, setConfirmDia] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const inviteConfirmFn = async () => {
    setBtnLoading(true);
    try {
      const tokenId = searchParams.get("tokenId");
      if (tokenId) {
        const res = await inviteConfirmApi(tokenId);

        if (res.code === 0) {
          toast.success(MESSAGE.joinCommunity);
        }
      }
    } finally {
      setBtnLoading(false);
      setConfirmDia(false);
    }
  };
  const validateEmail = async (tokenId: string) => {
    validateForgotPasswordEmail({
      token: tokenId as string,
    }).then((res) => {
      if (res.code === 200) {
        setConfirmDia(true);
      }
    });
  };
  useEffect(() => {
    const tokenId = searchParams.get("tokenId");
    if (tokenId) {
      validateEmail(tokenId);
    }
    useAppStore.getState().setStep(1);
  }, []);

  return (
    <div className="relative login:block flex items-center justify-center w-full h-full ">
      <div className="login:absolute left-[15%] top-[44%] login:translate-y-[-50%] w-[470px] px-[43px]">
        <div className="mb-[50px] text-center text-[36px] text-[rgba(0,0,0,0.85)] font-[400] ">
          Sign In
        </div>
        <LoginTabs type={type} setType={setType}></LoginTabs>
        <div className="mt-[47px]">
          <LoginForm></LoginForm>
        </div>
        <div className="h-10 mt-[31px] leading-10 text-center text-[#EB1DB2] font-[400]">
          <Link href="/register">Sign up with NASTi</Link>
        </div>
      </div>
      <ConfirmDialog
        btnLoading={btnLoading}
        open={confirmDia}
        onClose={() => {
          setConfirmDia(false);
        }}
        onOk={() => {
          inviteConfirmFn();
        }}
      >
        Are you sure you want to join the community {communityName}?
      </ConfirmDialog>
    </div>
  );
};

export default Login;
