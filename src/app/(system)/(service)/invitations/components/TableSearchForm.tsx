import { SearchParams } from "@/api/invitations/type";
import FormItemLabel from "@/components/custom/FormItemLabel";
import Input from "@/components/custom/Input";
interface TableSearchFormProps {
  search: () => void;
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
            label={"Community"}
          >
            <Input
              value={searchParams.communityName}
              onChange={(e) => {
                setSearchParams({
                  ...searchParams,
                  communityName: e.target.value,
                });
              }}
              placeholder="Search by Community"
              isClearable={true}
              suffix="SearchIcon"
            ></Input>
          </FormItemLabel>
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
