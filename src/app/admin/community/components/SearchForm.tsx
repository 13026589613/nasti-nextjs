import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Updater } from "use-immer";
import { useShallow } from "zustand/react/shallow";

import { getRegionsList } from "@/api/community";
import {
  // getSuperAdminCommunityList,
  getSuperAdminCompantTree,
} from "@/api/user";
import CustomButton from "@/components/custom/Button";
import FormItemLabel from "@/components/custom/FormItemLabel";
import Input from "@/components/custom/Input";
// import CustomSelect from "@/components/custom/Select";
import Select from "@/components/custom/Select";
import { getCompaniesStatusOptions } from "@/constant/listOption";
import useDepartmentStore from "@/store/useDepartmentStore";

import { CommunitySearchParams } from "../types";
interface TableSearchFormProps {
  searchParams: CommunitySearchParams;
  loading: {
    pageLoading: boolean;
    tableLoading: boolean;
  };
  add: () => void;
  setSearchParams: (value: CommunitySearchParams) => void;
  setLoading: Updater<{
    pageLoading: boolean;
    tableLoading: boolean;
  }>;
}

interface List {
  label: string;
  value: string;
  __isNew__?: boolean;
}

const TableSearchForm = (props: TableSearchFormProps) => {
  const { searchParams, setSearchParams, add } = props;
  const [stateList, setStateList] = useState([]);
  const pathname = usePathname();
  const { department, getDepartmentIds } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const [companyList, setCompanyList] = useState<List[]>([]);

  const getCompanyListFn = async () => {
    try {
      const res = await getSuperAdminCompantTree();
      if (res.code === 200) {
        setCompanyList(
          res.data.map((item) => ({ label: item.name, value: item.id }))
        );
      }
    } finally {
    }
  };

  const getRegionsSelect = async () => {
    const res = await getRegionsList({
      type: 1,
    });
    if (res.code == 200) {
      const arr = res.data.map((item: any) => {
        return {
          label: item.name,
          value: item.id,
        };
      }) as [];
      setStateList(arr);
    }
  };

  // const getCommunityListFn = async (companyId: string) => {
  //   try {
  //     const res = await getSuperAdminCommunityList(companyId);

  //     if (res.code == 200) {
  //       setCommunityList(
  //         res.data.map((item) => ({ label: item.name, value: item.id }))
  //       );
  //     }
  //   } finally {
  //   }
  // };

  useEffect(() => {
    getCompanyListFn();
    getRegionsSelect();
  }, []);

  useEffect(() => {
    const ids = getDepartmentIds(pathname);
    if (ids.length !== 0) {
      setSearchParams({
        ...searchParams,
        // departmentId: ids.join(","),
      });
    } else {
      setSearchParams({
        ...searchParams,
        // departmentId: "",
      });
    }
  }, [department]);

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex justify-between gap-x-5 w-full">
          <FormItemLabel
            className="w-[calc(25%-15px)]"
            labelClassName={"h-10"}
            label={"Company Name"}
          >
            <Select
              isClearable
              options={companyList}
              value={searchParams.companyId}
              placeholder="Company Name"
              onChange={(companyId) => {
                setSearchParams({ companyId });
              }}
            />
          </FormItemLabel>

          <FormItemLabel
            className="w-[calc(25%-15px)] mr-auto"
            label={"Community Name"}
          >
            <Input
              value={searchParams.name}
              onChange={(e) => {
                setSearchParams({
                  name: e.target.value,
                });
              }}
              placeholder="Search by Community Name"
              isClearable={true}
              suffix="SearchIcon"
            ></Input>
          </FormItemLabel>

          <FormItemLabel className="w-[calc(25%-15px)] mr-auto" label={"State"}>
            <Select
              isClearable
              options={stateList}
              value={searchParams.physicalState}
              placeholder="State"
              onChange={(state) => {
                setSearchParams({ ...searchParams, physicalState: state });
              }}
            />
          </FormItemLabel>

          <FormItemLabel
            className="w-[calc(25%-15px)] mr-auto"
            label={"Status"}
          >
            <Select
              isClearable
              options={getCompaniesStatusOptions?.()}
              value={searchParams.isEnabled}
              placeholder="Status"
              onChange={(value) => {
                setSearchParams({
                  ...searchParams,
                  isEnabled: value,
                });
              }}
            />
          </FormItemLabel>

          <div className="flex items-end h-20">
            <CustomButton icon="add" onClick={add}>
              Add
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
