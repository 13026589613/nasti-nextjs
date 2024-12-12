import { useDebounceFn } from "ahooks";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import AuthProvide from "@/components/custom/Auth";
import CustomButton from "@/components/custom/Button";
import Input from "@/components/custom/Input";
import Select from "@/components/custom/Select";
import { YES_NO_LIST } from "@/constant/listOption";
import { cn } from "@/lib/utils";
import useUserStore from "@/store/useUserStore";

import { SearchParams } from "../types";

/**
 * @description Search Props
 */
interface TableSearchFormProps {
  resetSearch: () => void;
  search: (data?: any) => void;
  add: () => void;
  searchParams: SearchParams;
  setSearchParams: (value: SearchParams) => void;
  listLength: number;
}

/**
 * @description Table Search Form
 */
const TableSearchForm = (props: TableSearchFormProps) => {
  const { search, searchParams, setSearchParams, listLength } = props;
  const pathname = usePathname();
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
  const returnSelectValue = (value: boolean | undefined | null) => {
    if (value === undefined || value === null) {
      return null;
    }
    if (value === true) {
      return "Yes";
    }
    if (value === false) {
      return "No";
    }
  };
  return (
    <div className="w-full weight-[390]">
      <div
        className={`${
          !isOnboarding ? "mt-[20px]" : "mt-[20px]"
        } flex justify-between mb-[20px]`}
      >
        <div className="w-full">
          <div className="w-full flex flex-wrap justify-end items-end px-1 mr-[0px] ml-[5px]">
            {isOnboarding &&
              listLength !== 0 &&
              pathname === "/myCommunity" && (
                <>
                  <div className="flex-1 mr-[20px]">
                    <div className="w-full leading-10 ">Department Name</div>
                    <Input
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        run();
                      }}
                      value={searchParams.name}
                      onChange={(e) => {
                        setSearchParams({
                          name: e.target.value,
                          isHppd: searchParams.isHppd,
                          isReportPbjHour: searchParams.isReportPbjHour,
                          isHppdDes: searchParams.isHppdDes,
                          isReportPbjHourDes: searchParams.isReportPbjHourDes,
                        });
                        run();
                      }}
                      placeholder="Search by Department Name"
                      isClearable
                      suffix="SearchIcon"
                    ></Input>
                  </div>

                  {/*  */}
                  <div className="flex-1 mr-[20px]">
                    <div className="w-full leading-10 ">
                      Schedule Based On HPRD
                    </div>
                    <Select
                      options={YES_NO_LIST}
                      value={returnSelectValue(searchParams.isHppd)}
                      isClearable
                      onChange={(e) => {
                        let value = undefined;
                        if (e === "Yes") {
                          value = true;
                        } else if (e === "No") {
                          value = false;
                        }

                        setSearchParams({
                          ...searchParams,
                          isHppd: value,
                        });
                        run();
                      }}
                      placeholder="Schedule Based On HPPD"
                    />
                  </div>

                  {/*  */}
                  <div className="flex-1 mr-[20px]">
                    <div className="w-full leading-10 ">Report PBJ Hours</div>
                    <Select
                      options={YES_NO_LIST}
                      value={returnSelectValue(searchParams.isReportPbjHour)}
                      isClearable
                      onChange={(e) => {
                        let value = undefined;
                        if (e === "Yes") {
                          value = true;
                        } else if (e === "No") {
                          value = false;
                        }
                        setSearchParams({
                          ...searchParams,
                          isReportPbjHour: value,
                        });
                        run();
                      }}
                      placeholder="Report PBJ Hours"
                    />
                  </div>

                  {/*  */}
                  <div className="flex-1 mr-[20px]">
                    <div className="w-full leading-10 ">Track Census</div>
                    <Select
                      options={YES_NO_LIST}
                      value={returnSelectValue(searchParams.isTrackCensus)}
                      isClearable
                      onChange={(e) => {
                        let value = undefined;
                        if (e === "Yes") {
                          value = true;
                        } else if (e === "No") {
                          value = false;
                        }
                        setSearchParams({
                          ...searchParams,
                          isTrackCensus: value,
                        });
                        run();
                      }}
                      placeholder="Track Census"
                    />
                  </div>
                </>
              )}
            {/* Add Button */}
            <div className="h-full flex items-end">
              <div
                className={cn(
                  "flex items-end h-[36px] justify-end",
                  !(
                    isOnboarding &&
                    listLength !== 0 &&
                    pathname === "/myCommunity"
                  ) && "ml-auto"
                )}
              >
                {isOnboarding &&
                  listLength !== 0 &&
                  pathname === "/myCommunity" && (
                    <div className="flex items-end mr-[20px]">
                      {/* <CustomButton
                        variant="outline"
                        onClick={() => {
                          setSearchParams({
                            name: "",
                            isHppd: undefined,
                            isReportPbjHour: undefined,
                            isTrackCensus: undefined,
                          });
                          resetSearch();
                        }}
                      >
                        Reset
                      </CustomButton> */}
                    </div>
                  )}
                <AuthProvide
                  authenticate={pathname === "/myCommunity"}
                  permissionName="COMMUNITY_MANAGEMENT_EDIT"
                >
                  <div className={"flex items-end justify-end"}>
                    <CustomButton icon="add" onClick={props.add}>
                      Add a Department
                    </CustomButton>
                  </div>
                </AuthProvide>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
