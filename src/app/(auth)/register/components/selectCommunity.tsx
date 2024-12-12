import Link from "next/link";

import AddCircleIcon from "~/icons/AddCircleIcon.svg";
import BigSearchIcon from "~/icons/BigSearchIcon.svg";

export interface RoleSelectProps {}
const SelectCommunity = ({}: RoleSelectProps) => {
  return (
    <div>
      <div className=" absolute right-[78px] top-[42px] text-[16px] font-[400] leading-10">
        Back to{" "}
        <Link href={"/login"}>
          <span className="text-[#EB1DB2]">Login</span>
        </Link>
      </div>
      <div className="absolute top-[50%] translate-y-[-50%] left-[56px]">
        <div
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
        <div
          className="flex items-center gap-[7px] h-[100px] w-[480px] rounded bg-[#46DB7A1A] 
          cursor-pointer text-[#324664] hover:text-[#EB1DB2] hover:bg-[#ED80E252]"
        >
          <AddCircleIcon
            className="ml-[41px] mr-[32px]"
            width="43"
            height="43"
          />
          <span className="font-[450]">Add New Community</span>
        </div>
      </div>
    </div>
  );
};

export default SelectCommunity;
