import { useEffect, useState } from "react";

import { getRoleListApi } from "@/api/admin/employees";
import {
  getSuperAdminCommunityList,
  getSuperAdminCompantTree,
} from "@/api/user";
import Input from "@/components/custom/Input";
import Select from "@/components/custom/Select";
import {
  getAdminUserListOptions,
  getAdminUserListOptionsPending,
} from "@/constant/listOption";
import { cn } from "@/lib/utils";

import { SearchParams } from "../type";
import DoButton from "./doButton";

interface TableSearchFormProps {
  currentBtn: string;
  searchParams: SearchParams;
  clickBtn: string;
  btnLoading: boolean;
  handleBtn: (value: string) => void;
  resetSearch?: () => void;
  setSearchParams: (value: SearchParams) => void;
}

interface List {
  label: string;
  value: string;
  __isNew__?: boolean;
}
const TableSearchForm = (props: TableSearchFormProps) => {
  const {
    searchParams,
    setSearchParams,
    currentBtn,
    handleBtn,
    btnLoading,
    clickBtn,
  } = props;
  const [statusList, setStatusList] = useState(getAdminUserListOptionsPending);
  const [companyList, setCompanyList] = useState<List[]>([]);
  const [communityList, setCommunityList] = useState<List[]>([]);
  const [workerRoleList, setWorkerRoleList] = useState<List[]>([]);

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

  const getRoleList = async (data: string) => {
    try {
      const res = await getRoleListApi(data);
      if (res.code === 200) {
        const result: { label: string; value: string }[] = res.data.map(
          (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          }
        );
        setWorkerRoleList(result as []);
      }
    } finally {
    }
  };

  useEffect(() => {
    searchParams.communityId = "";
  }, [searchParams.companyId]);

  useEffect(() => {
    getCompanyListFn();
    getCommunityListFn(null);
  }, []);

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-5 flex-wrap w-full">
          <div className="flex-1">
            <div className="w-full h-10 " />
            <Input
              value={searchParams.keywords}
              onChange={(e) => {
                setSearchParams({
                  keywords: e.target.value,
                });
              }}
              suffix="SearchIcon"
              placeholder="Search by Name/Email/Phone"
              isClearable
            ></Input>
          </div>
          <div className="flex-1">
            <div className="w-full leading-10 ">Company</div>
            <Select
              isClearable
              options={companyList}
              value={searchParams.companyId}
              placeholder="Company"
              onChange={(companyId) => {
                setSearchParams({ companyId, communityId: "", roleId: "" });
                if (companyId) {
                  getCommunityListFn(companyId);
                } else {
                  getCommunityListFn(null);
                }
                setWorkerRoleList([]);
              }}
            />
          </div>
          <div className="flex-1">
            <div className="w-full leading-10 ">Community</div>
            <Select
              isClearable
              options={communityList}
              value={searchParams.communityId}
              placeholder="Community"
              onChange={(communityId) => {
                setSearchParams({ communityId, roleId: "" });
                if (communityId) {
                  const list = getAdminUserListOptions().filter(
                    (item) => item.value == "3" || item.value == "4"
                  );
                  setStatusList(list);

                  getRoleList(communityId);
                } else {
                  setWorkerRoleList([]);
                }
              }}
            />
          </div>
          <div className="flex-1">
            <div className="w-full leading-10 ">Role</div>
            <Select
              isClearable
              options={workerRoleList}
              value={searchParams.roleId}
              placeholder="Role"
              onChange={(e) => {
                setSearchParams({
                  roleId: e,
                });
              }}
            />
          </div>
          <div className="flex-1">
            <div className="w-full leading-10 ">License</div>
            <Input
              value={searchParams.license}
              onChange={(e) => {
                setSearchParams({
                  license: e.target.value,
                });
              }}
              isClearable
              placeholder="Search by License"
              suffix="SearchIcon"
            ></Input>
          </div>
          {currentBtn == "Pending" && (
            <div className="flex-1">
              <div className="w-full leading-10 ">Invitation Status</div>
              <Select
                isClearable
                options={statusList}
                value={searchParams.status}
                placeholder="Invitation Status"
                onChange={(e) => {
                  setSearchParams({
                    status: e,
                  });
                }}
              />
            </div>
          )}
          <DoButton
            clickBtn={clickBtn}
            btnLoading={btnLoading}
            onClick={handleBtn}
            currentBtn={currentBtn}
            className={cn("mt-[40px]")}
          />
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
