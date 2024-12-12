import { useEffect, useState } from "react";
import { Updater } from "use-immer";

import { CommunityAdminUserSearchParams } from "@/api/admin/adminuser/type";
import {
  getSuperAdminCommunityList,
  getSuperAdminCompantTree,
} from "@/api/user";
import CustomButton from "@/components/custom/Button";
import FormItemLabel from "@/components/custom/FormItemLabel";
import Input from "@/components/custom/Input";
import CustomSelect from "@/components/custom/Select";
import { getAdminUserListOptions } from "@/constant/listOption";

/**
 * @description Search Props
 */
interface TableSearchFormProps {
  searchParams: CommunityAdminUserSearchParams;
  loading: {
    pageLoading: boolean;
    tableLoading: boolean;
    inviteLoading: boolean;
  };
  invite: () => void;
  add: () => void;
  setSearchParams: (value: CommunityAdminUserSearchParams) => void;
  setLoading: Updater<{
    pageLoading: boolean;
    tableLoading: boolean;
    inviteLoading: boolean;
  }>;
}

interface List {
  label: string;
  value: string;
  __isNew__?: boolean;
}

/**
 * @description Table Search Form
 */
export const TableSearchForm = (props: TableSearchFormProps) => {
  const { loading, invite, searchParams, setSearchParams } = props;

  const [companyList, setCompanyList] = useState<List[]>([]);
  const [communityList, setCommunityList] = useState<List[]>([]);

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

  const getCommunityListFn = async (companyId: string | null) => {
    try {
      const res = await getSuperAdminCommunityList(companyId);

      if (res.code == 200) {
        setCommunityList(
          res.data.map((item) => ({ label: item.name, value: item.id }))
        );
      }
    } finally {
    }
  };

  useEffect(() => {
    getCompanyListFn();
    getCommunityListFn(null);
  }, []);

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-x-5 w-full">
          <FormItemLabel className="flex-1" labelClassName={"h-10"} label={""}>
            <Input
              value={searchParams.condition}
              onChange={(e) => {
                setSearchParams({
                  condition: e.target.value,
                });
              }}
              placeholder="Search by Name/Email/Phone"
              suffix="SearchIcon"
              isClearable={true}
            ></Input>
          </FormItemLabel>
          <FormItemLabel className="flex-1 mr-auto" label={"Company"}>
            <CustomSelect
              value={searchParams.companyId}
              isClearable
              onChange={(value) => {
                setSearchParams({
                  ...searchParams,
                  communityId: "",
                  companyId: value,
                });
                getCommunityListFn(value);
              }}
              options={companyList}
              placeholder="Company"
            ></CustomSelect>
          </FormItemLabel>
          <FormItemLabel className="flex-1 mr-auto" label={"Community"}>
            <CustomSelect
              value={searchParams.communityId}
              isClearable
              onChange={(value) => {
                setSearchParams({
                  ...searchParams,
                  communityId: value,
                });
              }}
              options={communityList}
              placeholder="Community"
            ></CustomSelect>
          </FormItemLabel>
          <FormItemLabel className="flex-1 mr-3" label={"Title"}>
            <Input
              value={searchParams.title}
              onChange={(e) => {
                setSearchParams({
                  title: e.target.value,
                });
              }}
              isClearable
              placeholder="Search by Title"
              suffix="SearchIcon"
            ></Input>
          </FormItemLabel>
          <FormItemLabel className="flex-1 mr-auto" label={"Status"}>
            <CustomSelect
              value={searchParams.status}
              isClearable
              onChange={(value) => {
                setSearchParams({
                  ...searchParams,
                  status: value,
                });
              }}
              options={getAdminUserListOptions()}
              placeholder="Status"
            ></CustomSelect>
          </FormItemLabel>

          <div className="flex items-end h-20">
            <CustomButton
              loading={loading.inviteLoading}
              icon="share"
              colorStyle="yellow"
              onClick={invite}
            >
              Send Invite
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
