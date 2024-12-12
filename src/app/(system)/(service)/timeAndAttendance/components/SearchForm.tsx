import useSetState, { SetState } from "ahooks/lib/useSetState";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getUserWorkerList } from "@/api/user";
import { workerRoleList } from "@/api/workerRole";
import DatePicker from "@/components/custom/DatePicker";
import FormItemLabel from "@/components/custom/FormItemLabel";
import CustomSelect from "@/components/custom/Select";
import { getExceptionReasonOptions } from "@/constant/listOption";
// import { getNeedHelpShiftStatusOptions } from "@/constant/listOption";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";
import useUserStore from "@/store/useUserStore";

import { ExceptionReason } from "../types";

export interface SearchParams {
  roleId: string;
  userId: string;
  status: ExceptionReason | "";
  date: string | undefined;
}

export interface TimeOffSearchFormProps {
  type: string;
  searchParams: SearchParams;
  setSearchParams: SetState<SearchParams>;
  isHistory: boolean;
}
const TableSearchForm = (props: TimeOffSearchFormProps) => {
  const { isHistory, searchParams, setSearchParams } = props;

  const { departmentIds } = useGlobalDepartment();
  const { communityId } = useGlobalCommunityId();

  const [selectsInfo, setSelectsInfo] = useSetState({
    roleLoading: true,
    roleOptions: [] as { label: string; value: string }[],
    employeeLoading: true,
    employeeOptions: [] as { label: string; value: string }[],
  });

  const { operateCommunity } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

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

  const loadGetUserWorkerList = () => {
    let params: any = {
      communityId: operateCommunity.id as string,
      status: 1,
    };
    if (departmentIds) {
      params = {
        ...params,
        orderByDepartmentIds: departmentIds.join(","),
      };
    }
    getUserWorkerList(params)
      .then(({ code, data }) => {
        if (code !== 200) return;

        if (data)
          setSelectsInfo({
            employeeOptions: data.map((item) => ({
              label: `${item.firstName} ${item.lastName}`,
              value: item.userId,
            })),
          });
      })
      .finally(() =>
        setSelectsInfo({
          employeeLoading: false,
        })
      );
  };

  useEffect(() => {
    loadGetRoleList();
    loadGetUserWorkerList();
  }, [departmentIds, communityId]);

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-x-5 flex-wrap w-full">
          <FormItemLabel
            className="w-[24%]"
            labelClassName={"h-10"}
            label={"Role"}
          >
            <CustomSelect
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
          <FormItemLabel label="Employee" className="w-[24%]">
            <CustomSelect
              isClearable
              isLoading={selectsInfo.employeeLoading}
              options={selectsInfo.employeeOptions}
              value={searchParams.userId}
              onChange={(e) => {
                setSearchParams({
                  userId: e,
                });
              }}
              placeholder="Employee"
            />
          </FormItemLabel>
          <FormItemLabel
            className="w-[24%]"
            labelClassName={"h-10"}
            label={"Exception Reason"}
          >
            <CustomSelect
              options={getExceptionReasonOptions()}
              value={searchParams.status}
              onChange={(e) => {
                setSearchParams({
                  status: e,
                });
              }}
              placeholder="Exception Reason"
              isClearable={true}
            ></CustomSelect>
          </FormItemLabel>
          {isHistory && (
            <FormItemLabel
              className="w-[24%]"
              labelClassName={"h-10"}
              label={"Shift Date"}
            >
              <DatePicker
                value={searchParams.date}
                onChange={(data) => {
                  setSearchParams({
                    date: data,
                  });
                }}
                placeholder="Select Date"
              />
            </FormItemLabel>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
