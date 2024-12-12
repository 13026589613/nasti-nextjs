import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Updater } from "use-immer";
import { useShallow } from "zustand/react/shallow";

import AuthProvide from "@/components/custom/Auth";
import CustomButton from "@/components/custom/Button";
import FormItemLabel from "@/components/custom/FormItemLabel";
import Input from "@/components/custom/Input";
import CustomSelect from "@/components/custom/Select";
import { getAdminUserListOptions } from "@/constant/listOption";
import useDepartmentStore from "@/store/useDepartmentStore";

import { AdminUserSearchParams } from "../types";

/**
 * @description Search Props
 */
interface TableSearchFormProps {
  add: () => void;
  invite: () => void;
  searchParams: AdminUserSearchParams;
  loading: {
    pageLoading: boolean;
    tableLoading: boolean;
    inviteLoading: boolean;
  };
  setSearchParams: (value: AdminUserSearchParams) => void;
  setLoading: Updater<{
    pageLoading: boolean;
    tableLoading: boolean;
    inviteLoading: boolean;
  }>;
}

/**
 * @description Table Search Form
 */
const TableSearchForm = (props: TableSearchFormProps) => {
  const { loading, invite, searchParams, setSearchParams } = props;
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
        departmentId: ids.join(","),
      });
    } else {
      setSearchParams({
        ...searchParams,
        departmentId: "",
      });
    }
  }, [department]);
  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-x-5 flex-wrap w-full">
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
              placeholder="Search by Name/Email/Phone"
              suffix="SearchIcon"
              isClearable={true}
            ></Input>
          </FormItemLabel>
          <FormItemLabel className="w-[calc(25%-15px)] mr-3" label={"Title"}>
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
          <FormItemLabel
            className="w-[calc(25%-15px)] mr-auto"
            label={"Status"}
          >
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
          {/* Search Params - End */}
          <AuthProvide
            permissionName={[
              "PERMISSION_MANAGEMENT_EDIT",
              "PERMISSION_MANAGEMENT_ADD",
            ]}
          >
            {/* Add Button */}
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
          </AuthProvide>

          <AuthProvide permissionName="PERMISSION_MANAGEMENT_ADD">
            {/* Add Button */}
            <div className="flex items-end h-20 ">
              <CustomButton icon="add" onClick={props.add}>
                Add
              </CustomButton>
            </div>
          </AuthProvide>
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
