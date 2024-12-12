import { useDebounceFn } from "ahooks";

import DateYearPicker from "@/components/custom/DatePicker/year/index";

import { SearchParams } from "../type";

interface TableSearchFormProps {
  search: () => void;
  searchParams: SearchParams;
  setSearchParams: (value: SearchParams) => void;
}
const TableSearchForm = (props: TableSearchFormProps) => {
  const { searchParams, setSearchParams, search } = props;
  const { run } = useDebounceFn(
    () => {
      search();
    },
    {
      wait: 500,
    }
  );
  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-5 flex-wrap w-full">
          <div className="w-[280px]">
            <DateYearPicker
              value={searchParams.year}
              onChange={(date) => {
                setSearchParams({
                  ...searchParams,
                  year: date,
                });
                run();
              }}
              allowClear={false}
              placeholder="Please select"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
