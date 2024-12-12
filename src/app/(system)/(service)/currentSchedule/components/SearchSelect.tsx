import { useSetState } from "ahooks";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { locationListSearch } from "@/api/location";
import { getUserWorkerListRoleAll } from "@/api/user";
import { workerRoleList } from "@/api/workerRole";
import Select, { OptionType } from "@/components/custom/Select";
import { FormLabel } from "@/components/FormComponent";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useDepartmentStore from "@/store/useDepartmentStore";
import sortListByKey from "@/utils/sortByKey";

interface SearchSelectProps {
  onChange?: (value: {
    locationIds: string[];
    workerRoleIds: string[];
    userIds: string[];
    notAssigned: boolean;
  }) => void;
  currentView: string;
  currentSchedule: string;
}

const SearchSelect = (prop: SearchSelectProps) => {
  const { onChange, currentView, currentSchedule } = prop;
  const pathname = usePathname();

  const { communityId } = useGlobalCommunityId();

  const { department, getDepartmentIds } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const [queryViewForm, setQueryViewForm] = useSetState<{
    locationIds: string[];
    workerRoleIds: string[];
    userIds: string[];
    notAssigned: boolean;
  }>({
    locationIds: [],
    workerRoleIds: [],
    userIds: [],
    notAssigned: false,
  });

  const [selectsInfo, setSelectsInfo] = useSetState({
    locationLoading: true,
    locationOptions: [] as OptionType[],

    roleLoading: true,
    roleOptions: [] as OptionType[],

    employeeLoading: true,
    employeeOptions: [] as OptionType[],
  });

  const loadGetLocationList = () => {
    const departmentIds = getDepartmentIds(pathname).join(",")
      ? getDepartmentIds(pathname).join(",")
      : undefined;
    locationListSearch({
      communityId: communityId as string,
      isEnabled: true,
      departmentIds: departmentIds,
    })
      .then(({ code, data }) => {
        if (code !== 200) return;

        setSelectsInfo({
          locationOptions: sortListByKey(
            data.map((item) => ({
              label: item.name,
              value: item.id,
            }))
          ),
        });
      })
      .finally(() =>
        setSelectsInfo({
          locationLoading: false,
        })
      );
  };

  const loadGetRoleList = () => {
    const departmentIds = getDepartmentIds(pathname).join(",")
      ? getDepartmentIds(pathname).join(",")
      : null;
    workerRoleList(communityId as string, true, departmentIds)
      .then(({ code, data }) => {
        if (code !== 200) return;

        setSelectsInfo({
          roleOptions: sortListByKey(
            data.map((item) => ({
              label: item.name,
              value: item.id,
            }))
          ),
        });
      })
      .finally(() =>
        setSelectsInfo({
          roleLoading: false,
        })
      );
  };

  const loadGetUserWorkerList = () => {
    if (!communityId) return;
    const roleId = queryViewForm.workerRoleIds.join(",");
    let params: any = {
      communityId: communityId as string,
      departmentIds: getDepartmentIds(pathname).join(",")
        ? getDepartmentIds(pathname).join(",")
        : null,
      roleId: roleId ? roleId : null,
    };

    getUserWorkerListRoleAll(params)
      .then(({ code, data }) => {
        if (code !== 200) return;

        if (data)
          setSelectsInfo({
            employeeOptions: [
              {
                label: "Not Assigned",
                value: "notAssigned",
                __isNew__: true,
              },
              ...sortListByKey(
                data.map((item) => ({
                  label: `${item.firstName} ${item.lastName}`,
                  value: item.userId,
                }))
              ),
            ],
          });
      })
      .finally(() =>
        setSelectsInfo({
          employeeLoading: false,
        })
      );
  };
  useEffect(() => {
    if (communityId) {
      loadGetLocationList();
      loadGetRoleList();
      loadGetUserWorkerList();
    }
  }, [department, communityId]);

  useEffect(() => {
    loadGetUserWorkerList();
  }, [queryViewForm.workerRoleIds]);

  useEffect(() => {
    const { userIds } = queryViewForm;
    const userIdsNow: string[] = JSON.parse(JSON.stringify(userIds));
    let notAssignedIndex = -1;
    userIdsNow.forEach((item, index) => {
      selectsInfo.employeeOptions.forEach((option) => {
        if (item === option.value) {
          if (option.__isNew__) {
            notAssignedIndex = index;
          }
        }
      });
    });
    if (notAssignedIndex !== -1) {
      userIdsNow.splice(notAssignedIndex, 1);
    }
    onChange &&
      onChange({
        ...queryViewForm,
        userIds: userIdsNow,
      });
  }, [queryViewForm]);

  return (
    <>
      {!(currentView === "role" && currentSchedule === "Monthly") && (
        <FormLabel
          label="Location"
          className="flex-1 max-w-[400px] min-w-[200px]"
        >
          <Select
            isMulti
            isClearable
            isLoading={selectsInfo.locationLoading}
            options={selectsInfo.locationOptions}
            value={queryViewForm.locationIds}
            onChange={(value) => {
              setQueryViewForm({
                locationIds: value,
              });
            }}
            placeholder="Location"
          />
        </FormLabel>
      )}
      <FormLabel label="Role" className="flex-1 max-w-[400px] min-w-[200px]">
        <Select
          isClearable
          isMulti
          isLoading={selectsInfo.roleLoading}
          options={selectsInfo.roleOptions}
          value={queryViewForm.workerRoleIds}
          onChange={(value) => {
            setQueryViewForm({
              workerRoleIds: value,
            });
          }}
          placeholder="Role"
        />
      </FormLabel>
      {!(currentView === "role" && currentSchedule === "Monthly") && (
        <FormLabel
          label="Employee"
          className="flex-1 max-w-[400px] min-w-[200px]"
        >
          <Select
            isMulti
            isClearable
            isLoading={selectsInfo.employeeLoading}
            options={selectsInfo.employeeOptions}
            value={queryViewForm.userIds}
            onChange={(value) => {
              let notAssigned = false;
              value.forEach((item: string) => {
                selectsInfo.employeeOptions.forEach((option) => {
                  if (item === option.value) {
                    if (option.__isNew__) {
                      notAssigned = true;
                    }
                  }
                });
              });
              setQueryViewForm({
                userIds: value ? value : [],
                notAssigned: notAssigned,
              });
            }}
            placeholder="Employee"
          />
        </FormLabel>
      )}
    </>
  );
};

export default SearchSelect;
