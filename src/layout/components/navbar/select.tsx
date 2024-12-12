import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { useShallow } from "zustand/react/shallow";

import {
  getUserCompanyTree,
  getUserDepartmentList,
  setOperateCommunity,
} from "@/api/user";
import {
  GetUserCommunityListResponse,
  GetUserCompanyTreeResponse,
} from "@/api/user/types";
import AuthProvide from "@/components/custom/Auth";
import CustomSelect from "@/components/custom/Select";
import {
  CAN_EMPTY_DEPARTMENT_SELECT_PATH,
  DISABLED_COMMUNITY_SELECT_PATH,
  DISABLED_COMPANY_SELECT_PATH,
  DISABLED_DEPARTMENT_SELECT_PATH,
  HIDDEN_DEPARTMENT_SELECT_PATH,
  MULTIPLE_DEPARTMENT_SELECT_PATH,
  SINGLE_DEPARTMENT_SELECT_PATH,
} from "@/constant/authConstants";
import { getNumberOfWeek } from "@/constant/listOption";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useDepartmentStore from "@/store/useDepartmentStore";
import useTimeStore from "@/store/useTimeStore";
import useUserStore from "@/store/useUserStore";
import { useEventBus } from "@/utils/event";
import sortListByKey from "@/utils/sortByKey";
interface ListData {
  label: string;
  value: string;
}
export default function Select({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { operateCommunity, setOperateCommunity: setOperateCommunityStore } =
    useUserStore(
      useShallow((state) => ({
        ...state,
      }))
    );
  const [checkScheduleDisabled, setCheckScheduleDisabled] =
    useState<boolean>(false);
  useEventBus("set-header-select-disable", (value: boolean) =>
    setCheckScheduleDisabled(value)
  );
  useEventBus("set-header-department-id", (id: string) => setDepartmentIds(id));
  const {
    isRefreshCommunity,
    isRefreshDepartment,
    isNavbarDisabled,
    setIsRefreshCommunity,
    setIsRefreshDepartment,
  } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  useEffect(() => {
    setCheckScheduleDisabled(false);
  }, [pathname]);
  const { department, getDepartmentIds, setDepartment } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const [originalCompanyData, setoriginalCompanyData] = useState<
    GetUserCompanyTreeResponse[]
  >([]);
  const [companyList, setCompanyList] = useState<ListData[]>([]);
  const [communityList, setCommunityList] = useState<ListData[]>([]);
  const [departmentList, setDepartmentList] = useState<ListData[]>([]);

  const [departmentIds, setDepartmentIds] = useState<string | string[]>("");

  const [departmentInfo, setDepartmentInfo] = useImmer<{
    isShow: boolean;
    isMultiple: boolean;
    canEmpty: boolean;
  }>({
    isShow: false,
    isMultiple: false,
    canEmpty: true,
  });

  const getUserCompanyListFn = async (isRefreshLoading: boolean = true) => {
    if (isRefreshLoading) {
      setLoading(true);
    }

    try {
      const res = await getUserCompanyTree();
      if (res.code === 200) {
        setoriginalCompanyData(res.data);
        setCompanyList(
          sortListByKey(
            res.data.map((item) => {
              if (item.id === operateCommunity.companyId) {
                setCommunityList(
                  sortListByKey(
                    item.communityList.map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))
                  )
                );
              }
              return {
                label: item.name,
                value: item.id,
              };
            })
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getUserDepartmentListFn = async (communityId: string) => {
    setLoading(true);
    try {
      const res = await getUserDepartmentList({ communityId });
      if (res.code === 200) {
        const departmentList = res.data.map((item) => ({
          label: item.name,
          value: item.id,
        }));
        setDepartmentList(sortListByKey(departmentList));
        checkDepartmentSelect(departmentList);
      }
    } finally {
      setLoading(false);
    }
  };

  const setOperateCommunityFn = async (
    communityInfo: GetUserCommunityListResponse,
    companyId: string,
    callBack: () => void
  ) => {
    setLoading(true);
    try {
      const res = await setOperateCommunity(communityInfo.id);
      if (res.code === 200) {
        setOperateCommunityStore({
          companyId: companyId,
          id: communityInfo.id,
          name: communityInfo.name,
          isConfirmed: communityInfo.isConfirmed,
          isEnabled: communityInfo.isEnabled,
          startOfWeek: communityInfo.startOfWeek,
          timeZoneId: communityInfo.timeZoneId,
          zoneId: communityInfo.zoneId,
          attendanceEnabled: communityInfo.attendanceEnabled,
          userCommunityRefId: communityInfo.userCommunityRefId,
        });
        useTimeStore.getState().setGlobalTimeZone({
          globalTimeZone: communityInfo.zoneId as string,
          zoneAbbr: communityInfo.zoneShortName as string,
        });
        useTimeStore
          .getState()
          .setWeekOfStart(
            getNumberOfWeek(communityInfo.startOfWeek as string) === 7
              ? 0
              : getNumberOfWeek(communityInfo.startOfWeek as string)
          );
        callBack();
        if (!communityInfo.isConfirmed) {
          router.push("/myCommunity");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const companyChange = (value: string) => {
    const companyInfo = originalCompanyData.find((item) => item.id === value);

    if (companyInfo) {
      let communityInfo = companyInfo.communityList[0];
      for (let index = 0; index < companyInfo.communityList.length; index++) {
        const element = companyInfo.communityList[index];
        if (element.isConfirmed) {
          communityInfo = element;
          break;
        }
      }

      setOperateCommunityFn(communityInfo, value, () => {
        setCommunityList(
          sortListByKey(
            companyInfo.communityList.map((item) => ({
              label: item.name,
              value: item.id,
            }))
          )
        );
        useAppStore
          .getState()
          .setRefreshPermissionCommunityId(communityInfo.id);
      });
    }
  };

  const communityChange = (value: string) => {
    const companyInfo = originalCompanyData.find((item) => {
      const nowCommunityList = item.communityList;
      return nowCommunityList.find((item) => item.id === value);
    });
    if (companyInfo) {
      let communityInfo = companyInfo.communityList.find(
        (item) => item.id === value
      );
      if (communityInfo) {
        setOperateCommunityFn(communityInfo, companyInfo.id, () => {
          getUserDepartmentListFn(value);
          useAppStore
            .getState()
            .setRefreshPermissionCommunityId(communityInfo.id);
        });
      }
    }
  };

  const checkDepartmentSelect = (departmentList: ListData[]) => {
    const departmentSelect = getDepartmentIds(pathname);
    let departmentCheck = [];
    departmentList.forEach((item) => {
      if (departmentSelect.includes(item.value)) {
        departmentCheck.push(item);
      }
    });

    const hasValue =
      departmentCheck.length === departmentSelect.length &&
      departmentCheck.length > 0;

    if (hasValue) {
      setDepartmentIds(departmentSelect);
      setDepartment(departmentSelect, pathname);
    } else {
      if (!HIDDEN_DEPARTMENT_SELECT_PATH.includes(pathname)) {
        if (SINGLE_DEPARTMENT_SELECT_PATH.includes(pathname)) {
          if (CAN_EMPTY_DEPARTMENT_SELECT_PATH.includes(pathname)) {
            setDepartment([], pathname);
          } else {
            setDepartment(
              departmentList[0]?.value ? [departmentList[0]?.value] : [],
              pathname
            );
          }
        } else if (MULTIPLE_DEPARTMENT_SELECT_PATH.includes(pathname)) {
          if (CAN_EMPTY_DEPARTMENT_SELECT_PATH.includes(pathname)) {
            setDepartment([], pathname);
          } else {
            setDepartment(
              departmentList[0]?.value ? [departmentList[0]?.value] : [],
              pathname
            );
          }
        }
      }
    }
  };

  const departmentChange = (value: string | string[]) => {
    if (value === null || value.length === 0) {
      if (!departmentInfo.canEmpty) {
        return;
      }
    }
    if (departmentInfo.isMultiple) {
      setDepartment(value as string[], pathname);
    } else {
      setDepartment([value as string], pathname);
    }
  };

  useEffect(() => {
    const canEmpty = CAN_EMPTY_DEPARTMENT_SELECT_PATH.includes(pathname);

    setDepartmentIds(getDepartmentIds(pathname));

    if (SINGLE_DEPARTMENT_SELECT_PATH.includes(pathname)) {
      setDepartmentInfo({
        isShow: true,
        isMultiple: false,
        canEmpty,
      });
    } else if (MULTIPLE_DEPARTMENT_SELECT_PATH.includes(pathname)) {
      setDepartmentInfo({
        isShow: true,
        isMultiple: true,
        canEmpty,
      });
    } else {
      setDepartmentInfo((draft) => {
        draft.isShow = false;
      });
    }

    useAppStore.getState().setIsNavbarDisabled(false);
  }, [department, pathname]);

  useEffect(() => {
    checkDepartmentSelect(departmentList);
  }, [pathname]);

  useEffect(() => {
    if (operateCommunity?.id) {
      getUserDepartmentListFn(operateCommunity.id);
    }
  }, [operateCommunity]);

  useEffect(() => {
    getUserCompanyListFn();
  }, []);

  useEffect(() => {
    if (isRefreshCommunity) {
      getUserCompanyListFn(false);
      setIsRefreshCommunity(false);
    }
  }, [isRefreshCommunity]);

  useEffect(() => {
    if (isRefreshDepartment) {
      getUserDepartmentListFn(operateCommunity?.id as string);
      setIsRefreshDepartment(false);
    }
  }, [isRefreshDepartment]);

  return (
    <>
      <div className={cn("flex-1 flex gap-5 px-5", className)}>
        <div className="flex w-[calc(33%-20px)] flex-shrink-0 max-w-[400px] items-center gap-4 ml-2">
          <div className="font-[390] text-[16px] text-[#919FB4] leading-10">
            Company
          </div>
          <CustomSelect
            style={{ borderRadius: "20px" }}
            className="w-[calc(100%-88px)] rounded-[20px]"
            options={companyList}
            value={operateCommunity.companyId}
            onChange={(value) => {
              companyChange(value);
            }}
            isDisabled={
              checkScheduleDisabled ||
              DISABLED_COMPANY_SELECT_PATH.includes(pathname) ||
              isNavbarDisabled
            }
          ></CustomSelect>
        </div>

        <div className="flex w-[calc(33%-20px)] flex-shrink-0 max-w-[400px] items-center gap-4 ml-2">
          <div className="font-[390] text-[16px] text-[#919FB4] leading-10">
            Community
          </div>
          <CustomSelect
            style={{ borderRadius: "20px" }}
            className="w-[calc(100%-101px)] rounded-[20px]"
            options={communityList}
            value={operateCommunity.id}
            onChange={(value) => {
              communityChange(value);
            }}
            dropdownRender={({ closeMenu }) => {
              return (
                <>
                  <AuthProvide permissionName={"COMMUNITY_MANAGEMENT_ADD"}>
                    <div className="h-[56px] w-full flex items-center justify-end pr-5 mt-[-4px]">
                      <span
                        className="text-[#EB1DB2] font-[400] text-[16px] leading-10 cursor-pointer "
                        onClick={() => {
                          router.push("/community/create");
                          closeMenu();
                        }}
                      >
                        + Add Community
                      </span>
                    </div>
                  </AuthProvide>
                </>
              );
            }}
            isDisabled={
              checkScheduleDisabled ||
              DISABLED_COMMUNITY_SELECT_PATH.includes(pathname) ||
              isNavbarDisabled
            }
          ></CustomSelect>
        </div>
        {departmentInfo.isShow && (
          <div className="w-[calc(33%-20px)] flex-shrink-0 max-w-[500px] flex items-center gap-4 ml-2">
            <div className="font-[390] text-[16px] text-[#919FB4] leading-10">
              Department
            </div>
            <CustomSelect
              style={{ borderRadius: "20px" }}
              className="w-[calc(100%-105px)] rounded-[20px]"
              options={departmentList}
              value={
                departmentInfo.isMultiple ? departmentIds : departmentIds[0]
              }
              isMulti={departmentInfo.isMultiple}
              isClearable={departmentInfo.canEmpty}
              isSearchable
              onChange={departmentChange}
              isDisabled={
                checkScheduleDisabled ||
                DISABLED_DEPARTMENT_SELECT_PATH.includes(pathname) ||
                isNavbarDisabled
              }
            ></CustomSelect>
          </div>
        )}

        {loading && (
          <div className="fixed top-[80px] left-0 h-full w-full bg-white">
            <Loader2 className="animate-spin z-[34] absolute left-[50%] transform-[translateX(-50%)] top-[50%]" />
          </div>
        )}
      </div>
    </>
  );
}
