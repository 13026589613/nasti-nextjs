import { Updater } from "use-immer";

import CustomButton from "@/components/custom/Button";
import FormItemLabel from "@/components/custom/FormItemLabel";
import Input from "@/components/custom/Input";
import CustomSelect from "@/components/custom/Select";
import { getCompaniesStatusOptions } from "@/constant/listOption";

import { CompanySearchParams } from "../types";

/**
 * @description Search Props
 */
interface TableSearchFormProps {
  searchParams: CompanySearchParams;
  loading: {
    pageLoading: boolean;
    tableLoading: boolean;
  };
  setSearchParams: (value: CompanySearchParams) => void;
  setLoading: Updater<{
    pageLoading: boolean;
    tableLoading: boolean;
  }>;
  add: () => void;
}

/**
 * @description Table Search Form
 */
export const TableSearchForm = (props: TableSearchFormProps) => {
  const { add, searchParams, setSearchParams } = props;

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-x-5 flex-wrap w-full">
          <FormItemLabel
            className="w-[calc(25%-15px)]"
            labelClassName={"h-10"}
            label={"Company Name"}
          >
            <Input
              value={searchParams.name}
              onChange={(e) => {
                setSearchParams({
                  name: e.target.value,
                });
              }}
              placeholder="Search by Company Name"
              isClearable={true}
              suffix="SearchIcon"
            ></Input>
          </FormItemLabel>
          <FormItemLabel
            className="w-[calc(25%-15px)] mr-auto"
            label={"Status"}
          >
            <CustomSelect
              value={searchParams.isActive}
              isClearable
              onChange={(value) => {
                setSearchParams({
                  ...searchParams,
                  isActive: value,
                });
              }}
              options={getCompaniesStatusOptions?.()}
              placeholder="Status"
            ></CustomSelect>
          </FormItemLabel>
        </div>
        <div className="flex items-end h-20">
          <CustomButton icon="add" onClick={add}>
            Add
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
