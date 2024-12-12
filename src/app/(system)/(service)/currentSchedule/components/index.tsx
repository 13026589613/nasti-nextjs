"use client";

import { useSetState, useUpdateEffect } from "ahooks";
import { Moment } from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useImmer } from "use-immer";
import { useShallow } from "zustand/react/shallow";

import {
  scheduleShiftDelete,
  scheduleShiftDepartmentList,
} from "@/api/currentSchedule";
import {
  DepartmentShiftVO,
  ScheduleDepartment,
  ScheduleShift,
  ShiftEmployeeViewData,
} from "@/api/currentSchedule/types";
import AddShiftDialog from "@/app/(system)/(service)/currentSchedule/components/AddShiftDialog";
import SearchSelect from "@/app/(system)/(service)/currentSchedule/components/SearchSelect";
import StatusOfCurrentSchedule from "@/app/(system)/(service)/currentSchedule/components/status";
import AuthProvide from "@/components/custom/Auth";
import Button from "@/components/custom/Button";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import DayPicker from "@/components/custom/ScheduleDatePicker/DayPicker";
import ScheduleMonthPicker from "@/components/custom/ScheduleDatePicker/MonthPicker";
import WeekPicker from "@/components/custom/ScheduleDatePicker/WeekPicker";
import Tabs from "@/components/custom/Tabs";
import PageTitle from "@/components/PageTitle";
import CollapsiblePanel from "@/components/schedules/components/CollapsiblePanel";
import { WeeklyDaysType } from "@/components/schedules/types/weekly";
import { getDateString, getMonthlyString } from "@/components/schedules/utils";
import TabsButton from "@/components/TabsButton";
import { Checkbox } from "@/components/ui/checkbox";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";
import useGlobalTime from "@/hooks/useGlobalTime";
import useAuthStore from "@/store/useAuthStore";
import events from "@/utils/event";

import BulkEditDia from "./BulkEditDia";
// import { SchedulePlannerVo } from "../../schedulePlanner/type";
import ReviewShiftDialog from "./ReviewShiftDialog";
import ScheduleView from "./ScheduleView";
import ViewShiftDialog from "./ViewShiftDialog";

interface PageProps {
  handleRefresh?: () => void;
  type?: number;
  currentItem?: {
    //YYYY-MM-DD or MM/DD/YYYY
    startDate: string;
    endDate: string;
  };
}

const ScheduleIndex = (props: PageProps) => {
  const { handleRefresh, type, currentItem } = props;

  const { localMoment } = useGlobalTime();

  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const hasEditPermission = useMemo(() => {
    return permission.includes("SCHEDULE_MANAGEMENT_EDIT");
  }, [permission]);

  const hasAddPermission = useMemo(() => {
    return permission.includes("SCHEDULE_MANAGEMENT_ADD");
  }, [permission]);

  const shiftStartDate = currentItem?.startDate;
  const shiftEndDate = currentItem?.endDate;

  const { departmentIds } = useGlobalDepartment();
  const { communityId } = useGlobalCommunityId();
  const [checkedOverTime, setCheckedOverTime] = useState<boolean>(false);
  const [checkUnpublishedShifts, setCheckUnpublishedShifts] =
    useState<boolean>(false);
  const [currentView, setCurrentView] = useState("role");
  const [currentSchedule, setCurrentSchedule] = useState("Weekly");

  const currentDate = useMemo(() => {
    return shiftStartDate
      ? localMoment(shiftStartDate, "MM/DD/YYYY").toDate()
      : localMoment().toDate();
  }, [communityId]);

  // Day value
  const [dailyDate, setDailyDate] = useState<string | undefined>(
    getDateString(shiftStartDate ? shiftStartDate : currentDate, "MM/DD/YYYY")
  );

  // Week value
  const [weeklyDate, setWeeklyDate] = useState({
    from: shiftStartDate
      ? shiftStartDate
      : localMoment(currentDate).startOf("week").format("MM/DD/YYYY"),
    to: shiftEndDate
      ? shiftEndDate
      : localMoment(currentDate).endOf("week").format("MM/DD/YYYY"),
  });

  // Month value
  const [monthlyDate, setMonthlyDate] = useState<string>(
    getMonthlyString(
      shiftStartDate ? shiftStartDate : currentDate,
      "MM/DD/YYYY"
    )
  );

  useUpdateEffect(() => {
    if (currentSchedule === "Daily") {
      setDailyDate(
        getDateString(
          shiftStartDate ? shiftStartDate : currentDate,
          "MM/DD/YYYY"
        )
      );
    } else if (currentSchedule === "Weekly") {
      setWeeklyDate({
        from: shiftStartDate
          ? shiftStartDate
          : localMoment(currentDate).startOf("week").format("MM/DD/YYYY"),
        to: shiftEndDate
          ? shiftEndDate
          : localMoment(currentDate).endOf("week").format("MM/DD/YYYY"),
      });
    } else {
      setMonthlyDate(
        getMonthlyString(
          shiftStartDate ? shiftStartDate : currentDate,
          "MM/DD/YYYY"
        )
      );
    }
  }, [communityId]);

  const monthlyStartAndEnd = useMemo(() => {
    const date = localMoment(monthlyDate, "MM/YYYY");
    return {
      from: date.startOf("month").format("MM/DD/YYYY"),
      to: date.endOf("month").format("MM/DD/YYYY"),
    };
  }, [monthlyDate, currentSchedule, communityId]);

  const weeklyStartAndEnd = useMemo(() => {
    if (currentSchedule === "Weekly") {
      return {
        from: weeklyDate.from,
        to: weeklyDate.to,
      };
    } else if (currentSchedule === "Daily") {
      return {
        from: localMoment(dailyDate, "MM/DD/YYYY")
          .startOf("week")
          .format("MM/DD/YYYY"),
        to: localMoment(dailyDate, "MM/DD/YYYY")
          .endOf("week")
          .format("MM/DD/YYYY"),
      };
    } else {
      return {
        from: "",
        to: "",
      };
    }
  }, [weeklyDate, dailyDate, currentSchedule, communityId]);

  const [_employeeViewData, _setEmployeeViewData] = useImmer<{
    daily: ShiftEmployeeViewData<ScheduleDepartment> | null;
    weekly: ShiftEmployeeViewData<ScheduleDepartment> | null;
    monthly: any[];
  }>({
    daily: null,
    weekly: null,
    monthly: [],
  });

  // const employeeDaily = useRef<{
  //   [key: string]: any;
  // }>({});

  // const employeeWeekly = useRef<{
  //   [key: string]: any;
  // }>({});

  // const employeeMonthly = useRef<{
  //   [key: string]: any;
  // }>({});

  // const roleMonthly = useRef<{
  //   [key: string]: any;
  // }>({});

  // const roleWeekly = useRef<{
  //   [key: string]: any;
  // }>({});

  // const roleDaily = useRef<{
  //   [key: string]: any;
  // }>({});

  const [isView, setIsView] = useState(false);

  useEffect(() => {
    setIsView(type == 1);
  }, [type]);

  // Get date picker
  const getDatePicker = () => {
    switch (currentSchedule) {
      case "Daily":
        return (
          <DayPicker
            className="w-[310px]"
            value={dailyDate}
            onChange={setDailyDate}
          />
        );
      case "Weekly":
        return (
          <WeekPicker
            className="w-[400px]"
            startDate={weeklyDate.from}
            endDate={weeklyDate.to}
            onChange={({ startDate, endDate }) => {
              setWeeklyDate({
                from: startDate,
                to: endDate,
              });
            }}
          />
        );
      case "Monthly":
        return (
          <ScheduleMonthPicker
            className="w-[310px]"
            value={monthlyDate}
            onChange={setMonthlyDate}
          />
        );
    }
  };

  const loadGetScheduleShiftList = (departmentId?: string) => {
    if (currentView === "role") {
      switch (currentSchedule) {
        case "Daily":
          // roleDaily.current &&
          //   roleDaily.current[departmentId as string]?.refresh();
          loadGetScheduleShiftDepartmentList();
          return;

        case "Weekly":
          // roleWeekly.current &&
          //   roleWeekly.current[departmentId as string]?.refresh();
          loadGetScheduleShiftDepartmentList();
          return;

        case "Monthly":
          // roleMonthly.current &&
          //   roleMonthly.current[departmentId as string]?.refresh();
          loadGetScheduleShiftDepartmentList();
          return;
      }
    } else {
      switch (currentSchedule) {
        case "Daily":
          // employeeDaily.current &&
          //   employeeDaily.current[departmentId as string]?.refresh();
          loadGetScheduleShiftDepartmentList();
          return;

        case "Weekly":
          // employeeWeekly.current &&
          //   employeeWeekly.current[departmentId as string]?.refresh();
          loadGetScheduleShiftDepartmentList();
          return;

        case "Monthly":
          // employeeMonthly.current &&
          //   employeeMonthly.current[departmentId as string]?.refresh();
          loadGetScheduleShiftDepartmentList();
          return;
      }
    }
  };

  const [departmentList, setDepartmentList] = useImmer<DepartmentShiftVO[]>([]);

  useEffect(() => {
    loadGetScheduleShiftDepartmentList();
    setSelectShiftIds([]);
    setSelectShift([]);
  }, [
    communityId,
    departmentIds,
    currentView,
    currentSchedule,
    dailyDate,
    weeklyDate,
    monthlyDate,
  ]);

  const [defaultPickerValue, setDefaultPickerValue] = useState<
    Moment | undefined
  >(localMoment(currentDate));

  const [isHideAddButton, setIsHideAddButton] = useState<boolean>(false);

  useEffect(() => {
    switch (currentSchedule) {
      case "Daily":
        setIsHideAddButton(
          localMoment(dailyDate, "MM/DD/YYYY").isBefore(localMoment(), "day")
        );
        setDefaultPickerValue(localMoment(dailyDate, "MM/DD/YYYY"));
        break;
      case "Weekly":
        setIsHideAddButton(
          localMoment(weeklyDate.to, "MM/DD/YYYY").isBefore(
            localMoment(),
            "day"
          )
        );
        setDefaultPickerValue(localMoment(weeklyDate.from, "MM/DD/YYYY"));
        break;
      case "Monthly":
        setIsHideAddButton(
          localMoment(monthlyDate, "MM/YYYY")
            .endOf("month")
            .isBefore(localMoment(), "day")
        );
        setDefaultPickerValue(localMoment(monthlyDate, "MM/YYYY"));
        break;
    }
  }, [currentSchedule, dailyDate, weeklyDate, monthlyDate]);

  const defaultAddShiftDialogInfo = {
    open: false,
    shiftId: "",
    shiftDate: "",
    departmentId: departmentIds[0],
    workerRoleId: "",
    userId: "",
    roleId: "",
  };

  const [AddShiftDialogInfo, setAddShiftDialogInfo] = useSetState<{
    open: boolean;
    shiftId: string;
    shiftDate: string;
    departmentId: string;
    workerRoleId: string;
    userId: string;
    roleId: string;
  }>({
    ...defaultAddShiftDialogInfo,
  });

  const [ReviewShiftDialogInfo, setReviewShiftDialogInfo] = useSetState<{
    open: boolean;
    shiftId: string;
  }>({
    open: false,
    shiftId: "",
  });

  const [viewShiftDialogInfo, setViewShiftDialogInfo] = useSetState<{
    open: boolean;
    shiftId: string;
  }>({
    open: false,
    shiftId: "",
  });

  const [searchParamsValue, setSearchParamsValue] = useSetState<{
    locationIds: string[] | null;
    workerRoleIds: string[] | null;
    userIds: string[] | null;
    notAssigned: boolean;
  }>({
    locationIds: null,
    workerRoleIds: null,
    userIds: null,
    notAssigned: false,
  });

  const [departmentIdsOfWarn, setDepartmentIdsOfWarn] = useState<string[]>([]);
  const [departmentIdsOfWarnRole, setDepartmentIdsOfWarnRole] = useState<
    string[]
  >([]);

  let title = "Current Schedule";

  if (type == 2) {
    title = "Edit Schedule";
  } else if (type == 3) {
    title = "Create Schedule";
  } else if (type === 1) {
    title = "View Schedule";
  }

  const [selectShiftIds, setSelectShiftIds] = useState<string[]>([]);
  const [selectShift, setSelectShift] = useState<ScheduleShift[]>([]);

  const [deleteConfirm, setDeleteConfirm] = useSetState({
    visible: false,
    loading: false,
  });

  const deleteShift = async () => {
    try {
      setDeleteConfirm({
        loading: true,
      });
      const res = await scheduleShiftDelete(selectShiftIds.join(","));
      if (res.code === 200) {
        toast.success(MESSAGE.delete);
        loadGetScheduleShiftDepartmentList();
        setSelectShiftIds([]);
        setSelectShift([]);
      }
    } finally {
      setDeleteConfirm({
        visible: false,
        loading: false,
      });
    }
  };

  const [showBulkEditDialog, setIsShowBulkEditDialog] = useState(false);

  const isShowBulk = useMemo(() => {
    return !(currentView === "role" && currentSchedule === "Monthly");
  }, [currentView, currentSchedule]);

  const handleDailyAddShiftClick = useCallback(
    ({
      workerRoleId,
      departmentId,
    }: {
      workerRoleId: string;
      departmentId: string;
    }) => {
      setAddShiftDialogInfo({
        open: true,
        workerRoleId,
        departmentId,
        shiftDate: dailyDate as string,
      });
    },
    [dailyDate]
  );

  const handleShiftItemClick = useCallback(
    (shift: ScheduleShift, view: boolean) => {
      if (view) {
        setViewShiftDialogInfo({
          open: true,
          shiftId: shift.id,
        });
      } else {
        setAddShiftDialogInfo({
          open: true,
          shiftId: shift.id,
          shiftDate: shift.shiftDate,
          departmentId: shift.departmentId,
          workerRoleId: shift.workerRoleId,
          userId: shift.userId,
        });
      }
    },
    []
  );

  const handelSelectShift = useCallback(
    (shift: ScheduleShift) => {
      if (selectShiftIds.includes(shift.id)) {
        setSelectShiftIds(selectShiftIds.filter((id) => id !== shift.id));
      } else {
        setSelectShiftIds([...selectShiftIds, shift.id]);
      }

      if (selectShift.find((item) => item.id === shift.id)) {
        setSelectShift(selectShift.filter((item) => item.id !== shift.id));
      } else {
        setSelectShift([...selectShift, shift]);
      }
    },
    [selectShiftIds, selectShift]
  );

  const statusClick = useCallback((tag: number, shift: ScheduleShift) => {
    if (tag === 4) {
      setReviewShiftDialogInfo({
        open: true,
        shiftId: shift.id,
      });
    }
  }, []);

  const handleAddShiftClick = useCallback(
    ({
      weeklyDay,
      departmentId,
      roleId,
      userId,
    }: {
      roleId?: string;
      userId?: string;
      departmentId: string;
      weeklyDay: WeeklyDaysType;
    }) => {
      setAddShiftDialogInfo({
        open: true,
        shiftDate: weeklyDay.date as string,
        workerRoleId: roleId ? roleId : "",
        userId: userId ? userId : "",
        departmentId,
      });
    },
    []
  );

  const handleEmployeeDailyAddShiftClick = useCallback(
    ({ departmentId, userId }: { departmentId: string; userId: string }) => {
      setAddShiftDialogInfo({
        open: true,
        departmentId,
        userId,
        shiftDate: dailyDate as string,
      });
    },
    []
  );

  const loadGetScheduleShiftDepartmentList = useCallback(() => {
    let shiftStartDate = "";
    let shiftEndDate: string | null = "";

    switch (currentSchedule) {
      case "Daily":
        shiftStartDate = dailyDate as string;
        shiftEndDate = null;
        break;
      case "Weekly":
        shiftStartDate = weeklyDate.from;
        shiftEndDate = weeklyDate.to;
        break;
      case "Monthly":
        const date = localMoment(monthlyDate, "MM/YYYY");
        shiftStartDate = date.startOf("month").format("MM/DD/YYYY");
        shiftEndDate = date.endOf("month").format("MM/DD/YYYY");
        break;
    }

    console.log(departmentIds);

    scheduleShiftDepartmentList({
      communityId,
      departmentIds: departmentIds.length > 0 ? departmentIds : undefined,
      shiftStartDate,
      shiftEndDate,
      type: currentSchedule,
    }).then(({ code, data }) => {
      if (code !== 200) return;

      setDepartmentList(data.departmentShiftVOS);
    });
  }, [
    currentSchedule,
    dailyDate,
    weeklyDate,
    monthlyDate,
    communityId,
    departmentIds,
  ]);

  const setHasUnpublishedRole = useCallback(
    (departmentId: string, has: boolean) => {
      if (has) {
        if (!departmentIdsOfWarnRole.includes(departmentId)) {
          setDepartmentIdsOfWarnRole([
            ...departmentIdsOfWarnRole,
            departmentId,
          ]);
        }
      } else {
        if (departmentIdsOfWarnRole.includes(departmentId)) {
          setDepartmentIdsOfWarnRole(
            departmentIdsOfWarnRole.filter((id) => id !== departmentId)
          );
        }
      }
    },
    [departmentIdsOfWarnRole]
  );

  const setHasUnpublishedEmloyee = useCallback(
    (departmentId: string, has: boolean) => {
      if (has) {
        if (!departmentIdsOfWarn.includes(departmentId)) {
          setDepartmentIdsOfWarn([...departmentIdsOfWarn, departmentId]);
        }
      } else {
        if (departmentIdsOfWarn.includes(departmentId)) {
          setDepartmentIdsOfWarn(
            departmentIdsOfWarn.filter((id) => id !== departmentId)
          );
        }
      }
    },
    [departmentIdsOfWarn]
  );

  return (
    <>
      <PageTitle
        title={title}
        isClose={type != 4}
        rightClick={() => {
          events.emit("close-schedule");
          handleRefresh && handleRefresh();
        }}
      />
      <Tabs
        className="mt-[30px]"
        items={[
          {
            label: "Role View",
            key: "role",
          },
          {
            label: "Employee View",
            key: "employee",
          },
        ]}
        defaultActiveKey={currentView}
        onclick={setCurrentView}
      />
      <div className="flex items-end mt-[30px] flex-wrap gap-[20px] mb-4">
        <TabsButton
          items={[
            { key: "Daily", name: "Daily" },
            { key: "Weekly", name: "Weekly" },
            { key: "Monthly", name: "Monthly" },
          ]}
          currentKey={currentSchedule}
          onChange={setCurrentSchedule}
        />

        {getDatePicker()}

        <SearchSelect
          currentView={currentView}
          currentSchedule={currentSchedule}
          onChange={(value) => {
            let { workerRoleIds, userIds, locationIds, notAssigned } = value;

            setSearchParamsValue({
              workerRoleIds: workerRoleIds.length === 0 ? null : workerRoleIds,
              userIds: userIds.length === 0 ? null : userIds,
              locationIds: locationIds.length === 0 ? null : locationIds,
              notAssigned,
            });
          }}
        ></SearchSelect>
      </div>
      {type != 1 && (
        <div className="flex justify-end gap-4">
          {!isHideAddButton && (
            <AuthProvide permissionName={"SCHEDULE_MANAGEMENT_ADD"}>
              <Button
                icon="addShift"
                colorStyle="shallowZi"
                className="bg-[#6C5AD7]"
                onClick={() =>
                  setAddShiftDialogInfo({
                    ...defaultAddShiftDialogInfo,
                    open: true,
                  })
                }
              >
                Add Shift
              </Button>
            </AuthProvide>
          )}
          {isShowBulk && !isHideAddButton && (
            <>
              <AuthProvide permissionName={"SCHEDULE_MANAGEMENT_EDIT"}>
                <Button
                  icon="bulkEditIcon"
                  className="bg-[#8FCC41] hover:bg-[#8FCC41] "
                  onClick={() => {
                    if (selectShiftIds.length === 0) {
                      toast.warning("Please select the shifts to edit. ", {
                        position: "top-center",
                      });
                      return;
                    }

                    const isSameDepartment = selectShift.every(
                      (shift) =>
                        shift.departmentId === selectShift[0].departmentId
                    );

                    if (!isSameDepartment) {
                      toast.warning(
                        "Please select the shifts in the same department.",
                        {
                          position: "top-center",
                        }
                      );
                      return;
                    }

                    setIsShowBulkEditDialog(true);
                  }}
                >
                  Bulk Edit
                </Button>
              </AuthProvide>
              <AuthProvide permissionName={"SCHEDULE_MANAGEMENT_DELETE"}>
                <Button
                  icon="bulkDelete"
                  className="bg-[#EF4444] hover:bg-[#EF4444] "
                  onClick={() => {
                    if (selectShiftIds.length === 0) {
                      toast.warning("Please select the shifts to delete.", {
                        position: "top-center",
                      });
                      return;
                    }
                    setDeleteConfirm({
                      visible: true,
                    });
                  }}
                >
                  Bulk Delete
                </Button>
              </AuthProvide>
            </>
          )}
        </div>
      )}
      {["Daily", "Weekly"].includes(currentSchedule) && (
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <Checkbox
              checked={checkedOverTime}
              onCheckedChange={() => {
                setCheckedOverTime(!checkedOverTime);
              }}
            />
            <span className="ml-2 text-sm text-[#919FB4] font-medium">
              Overtime Shifts Only
            </span>
          </div>
          <div className="flex items-center">
            <Checkbox
              checked={checkUnpublishedShifts}
              onCheckedChange={() => {
                setCheckUnpublishedShifts(!checkUnpublishedShifts);
              }}
            />
            <span className="ml-2 text-sm text-[#919FB4] font-medium">
              Unpublished Shifts Only
            </span>
          </div>
        </div>
      )}

      {departmentList?.map((department, index) => {
        const isShowStatus =
          currentSchedule === "Weekly" && !!department.scheduleId;
        let isShowWarning = false;

        if (
          currentSchedule === "Weekly" &&
          currentView === "role" &&
          departmentIdsOfWarnRole.includes(department.departmentId) &&
          department.isPublished
        ) {
          isShowWarning = true;
        }

        if (
          currentSchedule === "Weekly" &&
          currentView === "employee" &&
          departmentIdsOfWarn.includes(department.departmentId) &&
          department.isPublished
        ) {
          isShowWarning = true;
        }
        return (
          <div key={department.departmentId} className="py-4">
            <CollapsiblePanel
              title={department.departmentName}
              isTriangleIcon
              defaultOpen
              centerRender={
                isShowStatus ? (
                  <StatusOfCurrentSchedule
                    status={department.isPublished ? "Published" : "Draft"}
                    isShowWarning={isShowWarning}
                  ></StatusOfCurrentSchedule>
                ) : (
                  ""
                )
              }
            >
              <ScheduleView
                department={department}
                currentView={currentView}
                currentSchedule={currentSchedule}
                dailyDate={dailyDate}
                selectShiftIds={selectShiftIds}
                checkedOverTime={checkedOverTime}
                checkUnpublishedShifts={checkUnpublishedShifts}
                hasAddPermission={hasAddPermission}
                hasEditPermission={hasEditPermission}
                isView={isView}
                searchParamsValue={searchParamsValue}
                communityId={communityId}
                weeklyDate={weeklyDate}
                monthlyDate={monthlyDate}
                handleEmployeeDailyAddShiftClick={
                  handleEmployeeDailyAddShiftClick
                }
                handleAddShiftClick={handleAddShiftClick}
                handleDailyAddShiftClick={handleDailyAddShiftClick}
                handleShiftItemClick={handleShiftItemClick}
                handelSelectShift={handelSelectShift}
                statusClick={statusClick}
                setHasUnpublishedRole={setHasUnpublishedRole}
                setHasUnpublishedEmloyee={setHasUnpublishedEmloyee}
                loadGetScheduleShiftDepartmentList={
                  loadGetScheduleShiftDepartmentList
                }
              ></ScheduleView>
            </CollapsiblePanel>
          </div>
        );
      })}
      {AddShiftDialogInfo.open && (
        <AddShiftDialog
          defaultPickerValue={defaultPickerValue}
          communityId={communityId}
          {...AddShiftDialogInfo}
          weeklyDate={
            currentSchedule === "Monthly"
              ? monthlyStartAndEnd
              : weeklyStartAndEnd
          }
          onClose={() =>
            setAddShiftDialogInfo({
              ...defaultAddShiftDialogInfo,
            })
          }
          onSuccess={(departmentId) => {
            loadGetScheduleShiftList(departmentId);
          }}
        />
      )}
      {ReviewShiftDialogInfo.open && (
        <ReviewShiftDialog
          shiftId={ReviewShiftDialogInfo.shiftId}
          communityId={communityId}
          onClose={() =>
            setReviewShiftDialogInfo({
              open: false,
              shiftId: "",
            })
          }
          onSuccess={(departmentId) => {
            loadGetScheduleShiftList(departmentId);
          }}
        ></ReviewShiftDialog>
      )}
      {viewShiftDialogInfo.open && (
        <ViewShiftDialog
          currentSchedule={currentSchedule}
          shiftId={viewShiftDialogInfo.shiftId}
          communityId={communityId}
          onClose={() =>
            setViewShiftDialogInfo({
              open: false,
              shiftId: "",
            })
          }
          onSuccess={(departmentId) => {
            loadGetScheduleShiftList(departmentId);
          }}
        ></ViewShiftDialog>
      )}
      {deleteConfirm.visible && (
        <ConfirmDialog
          open={deleteConfirm.visible}
          btnLoading={deleteConfirm.loading}
          width="560px"
          onClose={() => {
            setDeleteConfirm({
              visible: false,
              loading: false,
            });
          }}
          onOk={() => {
            deleteShift();
          }}
        >
          Are you sure you want to delete the selected shifts?
        </ConfirmDialog>
      )}
      {showBulkEditDialog && (
        <BulkEditDia
          communityId={communityId}
          departmentIds={departmentIds}
          defaultPickerValue={defaultPickerValue}
          weeklyDate={
            currentSchedule === "Monthly"
              ? monthlyStartAndEnd
              : weeklyStartAndEnd
          }
          selectShift={selectShift}
          onClose={() => {
            setIsShowBulkEditDialog(false);
          }}
          onSuccess={(departmentId) => {
            loadGetScheduleShiftList(departmentId);
            setIsShowBulkEditDialog(false);
            setSelectShiftIds([]);
            setSelectShift([]);
          }}
        ></BulkEditDia>
      )}
    </>
  );
};

export default ScheduleIndex;
