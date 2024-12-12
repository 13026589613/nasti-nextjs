import CustomButton from "@/components/custom/Button";
import Input from "@/components/custom/Input";

import { SearchParams } from "../types";

/**
 * @description Search Props
 */
interface TableSearchFormProps {
  resetSearch: () => void;
  search: () => void;
  add: () => void;
  searchParams: SearchParams;
  setSearchParams: (value: SearchParams) => void;
}

/**
 * @description Table Search Form
 */
const TableSearchForm = (props: TableSearchFormProps) => {
  const { resetSearch, search, searchParams, setSearchParams } = props;

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-5 flex-wrap w-full">
          {/* Search Params - Start */}

          {/* Filter Param - name */}
          <div className="w-[calc(25%-15px)]">
            <div className="w-full leading-10 ">Company Name</div>
            <Input
              value={searchParams.name}
              onChange={(e) => {
                setSearchParams({
                  name: e.target.value,
                });
              }}
              placeholder="Company Name"
            ></Input>
          </div>
          {/* Search Params - End */}

          {/* Operate Btns - Start */}
          <div className="flex items-end h-20 ">
            <CustomButton
              variant="outline"
              onClick={() => {
                setSearchParams({
                  name: "",
                }); // Reset Search Params
                resetSearch(); // Reset Search Params
              }}
            >
              Reset
            </CustomButton>
          </div>
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

          {/* Add Button */}
          <div className="flex items-end h-20 ">
            <CustomButton icon="add" onClick={props.add}>
              Add
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
