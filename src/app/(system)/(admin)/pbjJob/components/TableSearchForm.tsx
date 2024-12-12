import CustomButton from "@/components/custom/Button";

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
  const { resetSearch, search, setSearchParams } = props;

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-5 flex-wrap w-full">
          {/* Search Params - Start */}

          {/* Search Params - End */}

          {/* Operate Btns - Start */}
          <div className="flex items-end h-20 ">
            <CustomButton
              variant="outline"
              onClick={() => {
                setSearchParams({}); // Reset Search Params
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
