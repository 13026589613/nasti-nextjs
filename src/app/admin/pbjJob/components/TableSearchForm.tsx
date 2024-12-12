import { SearchParams } from "@/api/admin/pbjJob/type";
// import CustomButton from "@/components/custom/Button";
import FormItemLabel from "@/components/custom/FormItemLabel";
import Input from "@/components/custom/Input";

interface TableSearchFormProps {
  resetSearch: () => void;
  search: () => void;
  add?: () => void;
  searchParams: SearchParams;
  setSearchParams: (value: SearchParams) => void;
}

const TableSearchForm = (props: TableSearchFormProps) => {
  const { searchParams, setSearchParams } = props;

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-5 justify-start flex-wrap w-full">
          <FormItemLabel
            className="w-[calc(25%-15px)]"
            labelClassName={"h-10"}
            label={"Job Name"}
          >
            <Input
              value={searchParams.name}
              onChange={(e) => {
                setSearchParams({
                  ...searchParams,
                  name: e.target.value,
                });
              }}
              placeholder="Search by Job Name"
              isClearable={true}
              suffix="SearchIcon"
            ></Input>
          </FormItemLabel>
          <FormItemLabel
            className="w-[calc(25%-15px)]"
            labelClassName={"h-10"}
            label={"Job Code"}
          >
            <Input
              value={searchParams.code}
              onChange={(e) => {
                setSearchParams({
                  ...searchParams,
                  code: e.target.value,
                });
              }}
              placeholder="Search by Job Code"
              isClearable={true}
              suffix="SearchIcon"
            ></Input>
          </FormItemLabel>
        </div>
        {/* <div className="flex items-end h-20 ">
          <CustomButton icon="add" onClick={props.add}>
            Add Job
          </CustomButton>
        </div> */}
      </div>
    </div>
  );
};

export default TableSearchForm;
