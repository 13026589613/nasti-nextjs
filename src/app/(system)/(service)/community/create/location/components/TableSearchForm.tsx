import { useDebounceFn } from "ahooks";
import { usePathname } from "next/navigation";

import AuthProvide from "@/components/custom/Auth";
import CustomButton from "@/components/custom/Button";
import Input from "@/components/custom/Input";

import { SearchParams } from "../types";

/**
 * @description Search Props
 */
interface TableSearchFormProps {
  listLength: number;
  resetSearch: () => void;
  search: (data: any) => void;
  add: () => void;
  searchParams: SearchParams;
  setSearchParams: (value: SearchParams) => void;
}

/**
 * @description Table Search Form
 */
const TableSearchForm = (props: TableSearchFormProps) => {
  const { search, searchParams, listLength, setSearchParams } = props;
  const pathname = usePathname();
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
  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        {listLength !== 0 ? (
          <div className="flex-1 flex mr-[0px] ml-[5px] mt-5">
            <div className="w-[calc(45%-15px)]">
              <div className="w-full leading-10 ">Location Name</div>
              <Input
                value={searchParams.name}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  run();
                }}
                onChange={(e) => {
                  setSearchParams({
                    name: e.target.value,
                  });
                  run();
                }}
                placeholder="Search by Location Name"
                isClearable
                suffix="SearchIcon"
              ></Input>
            </div>
          </div>
        ) : (
          <div></div>
        )}

        <div className="flex gap-5 flex-wrap ">
          {/* Operate Btns - Start */}
          {listLength !== 0 && (
            <>
              <div className="flex items-end h-20 ">
                {/* <CustomButton
                  variant="outline"
                  onClick={() => {
                    setSearchParams({
                      name: "",
                    }); // Reset Search Params
                    resetSearch(); // Reset Search Params
                  }}
                >
                  Reset
                </CustomButton> */}
              </div>
              {/* <div className="flex items-end h-20 ">
                <CustomButton
                  icon="search"
                  colorStyle="purple"
                  onClick={() => {
                    search(); // Search Data
                  }}
                >
                  Search
                </CustomButton>
              </div> */}
            </>
          )}
          <AuthProvide
            authenticate={pathname === "/myCommunity"}
            permissionName="COMMUNITY_MANAGEMENT_EDIT"
          >
            {/* Add Button */}
            <div className="flex items-end h-20 ">
              <CustomButton icon="add" onClick={props.add}>
                Add a Location
              </CustomButton>
            </div>
          </AuthProvide>
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
