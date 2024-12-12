"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { validateForgotPasswordEmail } from "@/api/auth";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";

import RegisterEmailForm from "./components/RegisterEmailForm";
import RegisterInfoForm from "./components/RegisterInfoForm";
import RegisterPasswordForm from "./components/RegisterPasswordForm";
import { PasswordData, RegisterInfoLessData } from "./types";

const Register = () => {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("tokenId");
  const email = params.get("email");
  const [registerAgain, setRegisterAgain] = useState<boolean>(false);
  const [sendEmail, setSendEmail] = useState<string | null>(null);
  const [emailSame, setEmailSame] = useState<boolean>(false);
  const [type, setType] = useState<
    "email" | "password" | "info" | "hasSendEmail"
  >("email");
  const [passwordData, setPasswordData] = useState<PasswordData | null>(null);
  const [registerInfoLess, setRegisterInfoLess] =
    useState<RegisterInfoLessData | null>(null);
  const emailRef = useRef<any>(null);
  const [hasRegister, setHasRegister] = useState<boolean>(false);

  const validateEmail = async (tokenId: string) => {
    validateForgotPasswordEmail({
      token: tokenId as string,
    }).then((res) => {
      if (res.code === 200) {
        if (code) {
          setType("password");
        }
      } else {
        router.push("/login");
      }
    });
  };

  useEffect(() => {
    if (code && code != "isOnboarding" && !email) {
      validateEmail(code);
    }

    if (email) {
      setType("password");
    }

    if (code == "isOnboarding") {
      setType("info");
    }

    useAppStore.getState().setStep(1);
  }, []);
  return (
    <div className="login:relative login:block flex flex-col items-center justify-center w-full h-full ">
      <div className=" login:absolute login:right-[78px] top-[42px] text-[16px] font-[400] leading-10">
        Back to{" "}
        <Link href={"/login"}>
          <span className="text-[#EB1DB2]">Login</span>
        </Link>
      </div>
      <div className="login:absolute login:left-[20%] top-[46%] login:translate-y-[-50%] w-[490px] max-h-[100vh] px-[40px]">
        {(sendEmail == null && type !== "info") ||
        (type === "info" && !hasRegister) ? (
          <div
            className={cn(
              "w-full h-10 mt-[40px] leading-10 text-center text-[36px] font-[400]",
              emailSame ? "hidden" : ""
            )}
          >
            Sign Up
          </div>
        ) : null}

        {type === "email" && sendEmail != null && (
          <div className="w-full h-10 mt-[0px] leading-10 font-[390] relative top-[-60px]">
            <div className="text-[36px] font-[400] text-center mb-[40px]  text-[rgba(0, 0, 0, 0.45)]">
              Verify Your Account
            </div>
            <div className="text-[rgba(0, 0, 0, 0.45)]">
              We&apos;ve sent a verification email to {sendEmail}.
            </div>
            <div className="text-[rgba(0, 0, 0, 0.45)]">
              Please check your inbox and click the link in the email to verify
              your account.
            </div>
            <div className="text-[rgba(0, 0, 0, 0.45)]">
              Did not receive the verification email? Please{" "}
              <span
                className="text-[#EB1DB2] cursor-pointer"
                onClick={() => {
                  emailRef.current.handleSubmit({ email: sendEmail });
                }}
              >
                resend
              </span>
              .
            </div>
          </div>
        )}

        {type === "info" && hasRegister && (
          <div className="flex items-center w-full h-10 mt-[0px] leading-10 font-[390] relative top-[-60px]">
            <div className="text-[rgba(0, 0, 0, 0.45)]">
              Your request has been submitted. Please wait for approval from the
              community administrator. If you want to sign up for another
              community, click{" "}
              <span
                onClick={() => {
                  if (registerInfoLess) {
                    setRegisterInfoLess({
                      ...registerInfoLess,
                      communityId: "",
                      companyId: "",
                      title: "",
                    });
                  }
                  setHasRegister(false);
                  setRegisterAgain(true);
                }}
                className="text-[#EB1DB2] cursor-pointer"
              >
                here
              </span>
              .
            </div>
          </div>
        )}

        {emailSame && (
          <div className="flex items-center w-full h-10 mt-[0px] leading-10 font-[390] relative top-[-60px]">
            <div className="text-[rgba(0, 0, 0, 0.45)]">
              We found you. Please{" "}
              <Link href={"/login?type=isOnboarding"}>
                <span className="text-[#EB1DB2]">login</span>
              </Link>{" "}
              and then sign up for your community or join an existing community.
            </div>
          </div>
        )}

        <div
          className={cn(
            ` mt-[60px]`,
            sendEmail != null ? "hidden" : "",
            type === "info"
              ? !hasRegister
                ? "h-[calc(100vh-260px)]"
                : "max-h-[calc(100vh-160px)]"
              : "max-h-[calc(100vh-160px)]",
            emailSame ? "hidden" : ""
          )}
        >
          {type === "email" && (
            <RegisterEmailForm
              ref={emailRef}
              setType={setType}
              setSendEmail={setSendEmail}
              setEmailSame={setEmailSame}
            ></RegisterEmailForm>
          )}
          {type === "password" && (
            <RegisterPasswordForm
              passwordData={passwordData}
              setPasswordData={setPasswordData}
              setType={setType}
            ></RegisterPasswordForm>
          )}

          {type === "info" && !hasRegister && (
            <RegisterInfoForm
              setType={setType}
              registerAgain={registerAgain}
              passwordData={passwordData}
              registerInfoLess={registerInfoLess}
              setRegisterInfoLess={setRegisterInfoLess}
              handleSubmit={async (data, success) => {
                setHasRegister(success);
                setRegisterInfoLess(data);
              }}
            ></RegisterInfoForm>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
