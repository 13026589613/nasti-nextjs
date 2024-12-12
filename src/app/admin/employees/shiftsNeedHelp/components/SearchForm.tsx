import useSetState, { SetState } from "ahooks/lib/useSetState";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getUserWorkerList } from "@/api/user";
import { workerRoleList } from "@/api/workerRole";
import AuthProvide from "@/components/custom/Auth";
import CustomButton from "@/components/custom/Button";
import FormItemLabel from "@/components/custom/FormItemLabel";
import CustomSelect from "@/components/custom/Select";
import { getNeedHelpShiftStatusOptions } from "@/constant/listOption";
// import { getNeedHelpShiftStatusOptions } from "@/constant/listOption";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";
import useUserStore from "@/store/useUserStore";
import sortListByKey from "@/utils/sortByKey";

import { NeedHelpShiftStatusVo, TimeOffStatus } from "../types";

export interface SearchParams {
  roleId: string;
  userId: string;
  status: NeedHelpShiftStatusVo | "";
}

export interface TimeOffSearchFormProps {
  type: string;
  checkFn: (type: TimeOffStatus) => void;
  searchParams: SearchParams;
  setSearchParams: SetState<SearchParams>;
}
const TableSearchForm = (props: TimeOffSearchFormProps) => {
  const { type, checkFn, searchParams, setSearchParams } = props;

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
            employeeOptions: sortListByKey(
              data.map((item) => ({
                label: `${item.firstName} ${item.lastName}`,
                value: item.userId,
              }))
            ),
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
            label={"Status"}
          >
            <CustomSelect
              options={getNeedHelpShiftStatusOptions({
                type: type === "overtimeShifts" ? "overtimeShifts" : type,
              })}
              value={searchParams.status}
              onChange={(e) => {
                setSearchParams({
                  status: e,
                });
              }}
              placeholder="Status"
              isClearable={true}
            ></CustomSelect>
          </FormItemLabel>
        </div>
      </div>
      {type === "overtimeShifts" && (
        <AuthProvide permissionName={"SCHEDULE_MANAGEMENT_APPROVE_OVERTIME"}>
          <div className="flex justify-end items-start h-16 ">
            <CustomButton
              className="mr-5"
              colorStyle="orange"
              icon="error"
              onClick={() => {
                checkFn("REJECTED");
              }}
            >
              Reject
            </CustomButton>
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
        </AuthProvide>
      )}
    </div>
  );
};

export default TableSearchForm;
