import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Updater } from "use-immer";
import { useShallow } from "zustand/react/shallow";

import { SearchParams } from "@/api/admin/user/type";
import CustomButton from "@/components/custom/Button";
import FormItemLabel from "@/components/custom/FormItemLabel";
import Input from "@/components/custom/Input";
import useDepartmentStore from "@/store/useDepartmentStore";

interface TableSearchFormProps {
  searchParams: SearchParams;
  loading: {
    pageLoading: boolean;
    tableLoading: boolean;
  };
  add: () => void;
  setSearchParams: (value: SearchParams) => void;
  setLoading: Updater<{
    pageLoading: boolean;
    tableLoading: boolean;
  }>;
}

export const TableSearchForm = (props: TableSearchFormProps) => {
  const { add, searchParams, setSearchParams } = props;
  const pathname = usePathname();
  const { department, getDepartmentIds } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  useEffect(() => {
    const ids = getDepartmentIds(pathname);
    if (ids.length !== 0) {
      setSearchParams({
        ...searchParams,
      });
    } else {
      setSearchParams({
        ...searchParams,
      });
    }
  }, [department]);
  return (
    <div className="flex justify-between mb-[20px]">
      <FormItemLabel
        className="w-[calc(25%-15px)]"
        labelClassName={"h-10"}
        label={""}
      >
        <Input
          value={searchParams.condition}
          onChange={(e) => {
            setSearchParams({
              condition: e.target.value,
            });
          }}
          placeholder="Search by Name/Email"
          suffix="SearchIcon"
          isClearable={true}
        ></Input>
      </FormItemLabel>
      <div className="flex items-end h-20">
        <CustomButton icon="add" onClick={add}>
          Add
        </CustomButton>
      </div>
    </div>
  );
};

export default TableSearchForm;
