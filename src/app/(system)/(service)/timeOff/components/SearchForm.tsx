import useSetState, { SetState } from "ahooks/lib/useSetState";
import { useEffect } from "react";

import { workerRoleList } from "@/api/workerRole";
import AuthProvide from "@/components/custom/Auth";
import CustomButton from "@/components/custom/Button";
import FormItemLabel from "@/components/custom/FormItemLabel";
import Input from "@/components/custom/Input";
import RangeDatePicker from "@/components/custom/RangeDatePicker";
import CustomSelect from "@/components/custom/Select";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";

import { TimeOffStatus } from "../types";

export interface SearchParams {
  firstName: string;
  lastName: string;
  roleId: string;
  startDate: string[] | null;
  endDate: [string | null, string | null] | null;
}

export interface TimeOffSearchFormProps {
  searchParams: SearchParams;
  currentView: string;
  setSearchParams: SetState<SearchParams>;
  checkFn: (type: TimeOffStatus) => void;
}
const TableSearchForm = (props: TimeOffSearchFormProps) => {
  const { searchParams, currentView, setSearchParams, checkFn } = props;

  const { departmentIds } = useGlobalDepartment();
  const { communityId } = useGlobalCommunityId();

  const [selectsInfo, setSelectsInfo] = useSetState({
    roleLoading: true,
    roleOptions: [] as { label: string; value: string }[],
  });

  const loadGetRoleList = () => {
    const departmentIdsNow = departmentIds.join(",")
      ? departmentIds.join(",")
      : null;
    workerRoleList(communityId, true, departmentIdsNow)
      .then(({ code, data }) => {
        if (code !== 200) return;

        setSelectsInfo({
          roleOptions: data.map((item) => ({
            label: item.name,
            value: item.id,
          })),
        });
      })
      .finally(() =>
        setSelectsInfo({
          roleLoading: false,
        })
      );
  };

  useEffect(() => {
    loadGetRoleList();
  }, [departmentIds, communityId]);

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-x-5 flex-wrap w-full">
          <FormItemLabel
            className="w-[calc(28%-0px)]"
            labelClassName={"h-10"}
            label={"First Name"}
          >
            <Input
              value={searchParams.firstName}
              onChange={(e) => {
                setSearchParams({
                  firstName: e.target.value,
                });
              }}
              placeholder="Search by First Name"
              isClearable={true}
              suffix="SearchIcon"
            ></Input>
          </FormItemLabel>
          <FormItemLabel
            className="w-[calc(28%-0px)]"
            labelClassName={"h-10"}
            label={"Last Name"}
          >
            <Input
              value={searchParams.lastName}
              onChange={(e) => {
                setSearchParams({
                  lastName: e.target.value,
                });
              }}
              placeholder="Search by Last Name"
              isClearable={true}
              suffix="SearchIcon"
            ></Input>
          </FormItemLabel>
          <FormItemLabel
            className="w-[calc(28%-0px)]"
            labelClassName={"h-10"}
            label={"Role"}
          >
            <CustomSelect
              className="h-10"
              options={selectsInfo.roleOptions}
              isLoading={selectsInfo.roleLoading}
              value={searchParams.roleId}
              onChange={(e) => {
                setSearchParams({
                  roleId: e,
                });
              }}
              placeholder="Role"
              isClearable={true}
            ></CustomSelect>
          </FormItemLabel>
          <FormItemLabel
            className="w-[calc(28%-0px)]"
            labelClassName={"h-10"}
            label={`Start Date Time`}
          >
            <RangeDatePicker
              value={searchParams.startDate}
              onChange={(value) => {
                setSearchParams({
                  startDate: value
                    ? [value[0] ? value[0] : null, value[1] ? value[1] : null]
                    : null,
                });
              }}
            ></RangeDatePicker>
          </FormItemLabel>
          <FormItemLabel
            className="w-[calc(28%-0px)]"
            labelClassName={"h-10"}
            label={`End Date Time`}
          >
            <RangeDatePicker
              value={searchParams.endDate}
              onChange={(value) => {
                setSearchParams({
                  endDate: value ? [value[0], value[1]] : null,
                });
              }}
            ></RangeDatePicker>
          </FormItemLabel>
          {currentView === "request" && (
            <AuthProvide permissionName={"EMPLOYEE_MANAGEMENT_APPROVE_TIMEOFF"}>
              <>
                <div className="flex items-end h-20 ">
                  <CustomButton
                    colorStyle="green"
                    icon="right"
                    onClick={() => {
                      checkFn("APPROVED");
                    }}
                  >
                    Approve
                  </CustomButton>
                </div>
                <div className="flex items-end h-20 ">
                  <CustomButton
                    colorStyle="orange"
                    icon="error"
                    onClick={() => {
                      checkFn("REJECTED");
                    }}
                  >
                    Reject
                  </CustomButton>
                </div>
              </>
            </AuthProvide>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
