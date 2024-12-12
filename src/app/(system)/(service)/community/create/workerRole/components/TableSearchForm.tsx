import { useDebounceFn } from "ahooks";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import AuthProvide from "@/components/custom/Auth";
import CustomButton from "@/components/custom/Button";
import Input from "@/components/custom/Input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import useUserStore from "@/store/useUserStore";
import QuestionIcon from "~/icons/QuestionIcon.svg";

import { SearchParams } from "../types";

/**
 * @description Search Props
 */
interface TableSearchFormProps {
  resetSearch: () => void;
  search: (data: any) => void;
  add: () => void;
  listLength: number;
  searchParams: SearchParams;
  setSearchParams: (value: SearchParams) => void;
}

/**
 * @description Table Search Form
 */
const TableSearchForm = (props: TableSearchFormProps) => {
  const { search, searchParams, listLength, setSearchParams } = props;
  const { isOnboarding } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const { run } = useDebounceFn(
    () => {
      search({
        ...searchParams,
        pageNum: 1,
      });
    },
    {
      wait: 500,
    }
  );
  const pathname = usePathname();
  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex-1 flex mr-[0px] ml-[5px] mt-5">
          {isOnboarding && listLength !== 0 && pathname === "/myCommunity" && (
            <>
              {/* Search Params - Start */}
              {/* Filter Param - name */}
              <div className="w-[calc(40%-15px)]">
                <div className="w-full leading-10 ">Role Name</div>
                <Input
                  value={searchParams.name}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    run();
                  }}
                  onChange={(e) => {
                    setSearchParams({
                      code: searchParams.code,
                      name: e.target.value,
                    });
                    run();
                  }}
                  placeholder="Search by Role Name"
                  isClearable
                  suffix="SearchIcon"
                ></Input>
              </div>
              {/* Filter Param - code */}
              <div className="w-[calc(40%-15px)] ml-[20px]">
                <div className="w-full leading-10 ">Job Code</div>
                <Input
                  value={searchParams.code}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    run();
                  }}
                  onChange={(e) => {
                    setSearchParams({
                      code: e.target.value,
                      name: searchParams.name,
                    });
                    run();
                  }}
                  placeholder="Search by Job Code"
                  isClearable
                  suffix="SearchIcon"
                ></Input>
              </div>
              {/* Search Params - End */}
            </>
          )}
        </div>

        <div className="flex gap-5 flex-wrap">
          {/* Operate Btns - Start */}
          {isOnboarding && listLength !== 0 && pathname === "/myCommunity" && (
            <div className="flex items-end h-20 ">
              {/* <CustomButton
                variant="outline"
                onClick={() => {
                  setSearchParams({
                    code: "",
                    name: "",
                  }); // Reset Search Params
                  resetSearch(); // Reset Search Params
                }}
              >
                Reset
              </CustomButton> */}
            </div>
          )}

          {/* {isOnboarding && listLength !== 0 && (
            <>
              <div className="flex items-end h-20 ">
                <CustomButton
                  icon="search"
                  colorStyle="purple"
                  onClick={() => {
                    search(); // Search Data
                  }}
                >
                  Search
                </CustomButton>
              </div>
            </>
          )} */}

          {/* Add Button */}
          <div
            className={cn(
              "flex items-end h-20 justify-end",
              isOnboarding ? "" : "ml-[auto]",
              !isOnboarding ? "mt-[20px] " : ""
            )}
          >
            <div className="relative cursor-pointer mr-5 -top-[6px]">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger>
                    <QuestionIcon
                      className="cursor-pointer"
                      color="var(--primary-color)"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      A Role should simply describe the functions you want a
                      team member to
                    </p>
                    <p>
                      perform. Think of things like Caregiver, Floor Nurse, Line
                      Cook, etc.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <AuthProvide
              authenticate={pathname === "/myCommunity"}
              permissionName="COMMUNITY_MANAGEMENT_EDIT"
            >
              <CustomButton icon="add" onClick={props.add}>
                Add a Role
              </CustomButton>
            </AuthProvide>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
