"use client";

import Link from "next/link";
import { useState } from "react";

import AddCircleIcon from "~/icons/AddCircleIcon.svg";
import BigSearchIcon from "~/icons/BigSearchIcon.svg";

import SelectDia from "./components/selectDia";

const Onboarding = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full h-full relative">
      <div className=" absolute right-[78px] top-[42px] text-[16px] font-[400] leading-10">
        Back to{" "}
        <Link href={"/login"}>
          <span className="text-[#EB1DB2]">Login</span>
        </Link>
      </div>
      <div className="absolute top-[50%] translate-y-[-50%] left-[56px]">
        <div
          onClick={() => {
            setOpen(true);
          }}
          className="flex items-center gap-[7px] h-[100px] w-[480px] mb-[57px] rounded bg-[#46DB7A1A] 
          cursor-pointer text-[#324664] hover:text-[#EB1DB2] hover:bg-[#ED80E252]"
        >
          <BigSearchIcon
            className="ml-[31px] mr-[21px]"
            width="64"
            height="64"
          />
          <span className="font-[450]">Search for Community to Join</span>
        </div>
        <Link
          href={"/community/create"}
          className="flex items-center gap-[7px] h-[100px] w-[480px] rounded bg-[#46DB7A1A] 
          cursor-pointer text-[#324664] hover:text-[#EB1DB2] hover:bg-[#ED80E252]"
        >
          <AddCircleIcon
            className="ml-[41px] mr-[32px]"
            width="43"
            height="43"
          />
          <span className="font-[450]">Add New Community</span>
        </Link>
      </div>
      <SelectDia open={open} setOpen={setOpen}></SelectDia>
    </div>
  );
};

export default Onboarding;
