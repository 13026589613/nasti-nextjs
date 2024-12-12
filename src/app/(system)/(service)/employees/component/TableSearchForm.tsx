import { useEffect, useState } from "react";

import { getworkerRoleSelect } from "@/api/employees";
import Input from "@/components/custom/Input";
import Select from "@/components/custom/Select";
import { getAdminUserListOptions } from "@/constant/listOption";

import { SearchParams } from "../type";

interface TableSearchFormProps {
  resetSearch?: () => void;

  searchParams: SearchParams;
  setSearchParams: (value: SearchParams) => void;
  communityId: string;
  currentBtn: string;
}
const TableSearchForm = (props: TableSearchFormProps) => {
  const { searchParams, setSearchParams, communityId, currentBtn } = props;
  const [workerRoleList, setWorkerRoleList] = useState([]);
  const [statusList, setStatusList] = useState(getAdminUserListOptions);

  useEffect(() => {
    if (communityId) {
      getRoleList(communityId);
    }
    const list = getAdminUserListOptions().filter(
      (item) => item.value == "3" || item.value == "4"
    );
    setStatusList(list);
  }, [communityId]);
  const getRoleList = async (data: string) => {
    try {
      const res = await getworkerRoleSelect(data);
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
  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-5 flex-wrap w-full">
          <div className="w-[calc(25%-15px)]">
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
          <div className="w-[calc(25%-15px)]">
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
          <div className="w-[calc(25%-15px)]">
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
            <div className="w-[calc(25%-15px)]">
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
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
