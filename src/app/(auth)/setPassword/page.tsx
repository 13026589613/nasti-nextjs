"use client";
import Link from "next/link";
import { useState } from "react";

import Spin from "@/components/custom/Spin";

import SetForm from "./components/SetPasswordForm";

const SetPassword = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="login:relative login:block flex flex-col justify-center items-center w-full h-full">
      <div className="login:absolute login:right-[78px] top-[42px] text-[16px] font-[400] leading-10">
        Back to{" "}
        <Link href={"/login"}>
          <span className="text-[#EB1DB2]">Login</span>
        </Link>
      </div>
      <div className="login:absolute login:left-[20%] top-[46%] login:translate-y-[-50%] w-[490px] max-h-[100vh] px-[40px]">
        <Spin loading={loading}>
          <SetForm setLoading={setLoading}></SetForm>
        </Spin>
      </div>
    </div>
  );
};

export default SetPassword;
