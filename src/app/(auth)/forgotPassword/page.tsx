"use client";
import Link from "next/link";
import { useState } from "react";

import Spin from "@/components/custom/Spin";

import ForgotForm from "./components/ForgotPasswordForm";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="login:relative login:block flex flex-col justify-center items-center w-full h-full">
      <div className="login:absolute login:right-[78px] top-[42px] text-[16px] font-[400] leading-10">
        Back to{" "}
        <Link href={"/login"}>
          <span className="text-[#EB1DB2]">Login</span>
        </Link>
      </div>
      <div className="login:absolute login:left-[68px] top-[46%] login:translate-y-[-50%] w-[470px] px-[40px]">
        <Spin loading={loading}>
          <ForgotForm setLoading={setLoading}></ForgotForm>
        </Spin>
      </div>
    </div>
  );
};

export default ForgotPassword;
