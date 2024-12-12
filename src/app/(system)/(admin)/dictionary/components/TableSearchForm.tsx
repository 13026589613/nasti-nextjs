import CustomButton from "@/components/custom/Button";
import Input from "@/components/custom/Input";

import { SearchParams } from "../type";

interface TableSearchFormProps {
  resetSearch: () => void;
  search: () => void;
  add: () => void;
  searchParams: SearchParams;
  setSearchParams: (value: SearchParams) => void;
}
const TableSearchForm = (props: TableSearchFormProps) => {
  const { resetSearch, search, searchParams, setSearchParams } = props;

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-5 flex-wrap w-full">
          <div className="w-[calc(25%-15px)]">
            <div className="w-full leading-10 ">Name</div>
            <Input
              value={searchParams.description}
              onChange={(e) => {
                setSearchParams({
                  description: e.target.value,
                  code: searchParams.code,
                });
              }}
              placeholder="Name"
            ></Input>
          </div>
          <div className="w-[calc(25%-15px)]">
            <div className="w-full leading-10 ">Type</div>
            <Input
              value={searchParams.code}
              onChange={(e) => {
                setSearchParams({
                  description: searchParams.description,
                  code: e.target.value,
                });
              }}
              placeholder="Type"
            ></Input>
          </div>
          <div className="flex items-end h-20 ">
            <CustomButton
              icon="reset"
              variant="outline"
              onClick={() => {
                setSearchParams({ description: "", code: "" });
                resetSearch();
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
                search();
              }}
            >
              Search
            </CustomButton>
          </div>
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
