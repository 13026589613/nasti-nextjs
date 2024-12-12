import { memo } from "react";

import { DepartmentShiftVO, ScheduleShift } from "@/api/currentSchedule/types";
import EmployeeViewDaily from "@/components/schedules/currentSchedule/package/EmployeeView/Daily";
import EmployeeScheduleMonthly from "@/components/schedules/currentSchedule/package/EmployeeView/Monthly";
import EmployeeViewWeekly from "@/components/schedules/currentSchedule/package/EmployeeView/Weekly";
import RoleViewDaily from "@/components/schedules/currentSchedule/package/RoleView/Daily";
import RoleViewMonthly from "@/components/schedules/currentSchedule/package/RoleView/Monthly";
import RoleViewWeekly from "@/components/schedules/currentSchedule/package/RoleView/Weekly";
import { WeeklyDaysType } from "@/components/schedules/types/weekly";
import {
  formatDate,
  getDateObject,
  getDaysInterval,
  getWeekDays,
} from "@/components/schedules/utils";
import useGlobalTime from "@/hooks/useGlobalTime";
interface ScheduleViewProps {
  department: DepartmentShiftVO;
  currentView: string;
  currentSchedule: string;
  dailyDate: string | undefined;
  selectShiftIds: string[];
  checkedOverTime: boolean;
  checkUnpublishedShifts: boolean;
  hasAddPermission: boolean;
  hasEditPermission: boolean;
  isView: boolean;
  searchParamsValue: {
    locationIds: string[] | null;
    workerRoleIds: string[] | null;
    userIds: string[] | null;
    notAssigned: boolean;
  };
  communityId: string;
  weeklyDate: { from: string; to: string };
  monthlyDate: string;
  handleDailyAddShiftClick: ({
    workerRoleId,
    departmentId,
  }: {
    workerRoleId: string;
    departmentId: string;
  }) => void;
  handleShiftItemClick: (shift: ScheduleShift, view: boolean) => void;
  handelSelectShift: (shift: ScheduleShift) => void;
  statusClick: (tag: number, shift: ScheduleShift) => void;
  handleAddShiftClick: ({
    weeklyDay,
    departmentId,
    roleId,
    userId,
  }: {
    roleId?: string;
    userId?: string;
    departmentId: string;
    weeklyDay: WeeklyDaysType;
  }) => void;
  handleEmployeeDailyAddShiftClick: ({
    departmentId,
    userId,
  }: {
    departmentId: string;
    userId: string;
  }) => void;
  loadGetScheduleShiftDepartmentList: () => void;
  setHasUnpublishedRole: (departmentId: string, has: boolean) => void;
  setHasUnpublishedEmloyee: (departmentId: string, has: boolean) => void;
}

const ScheduleView = (props: ScheduleViewProps) => {
  const {
    department,
    currentView,
    currentSchedule,
    dailyDate,
    selectShiftIds,
    checkedOverTime,
    checkUnpublishedShifts,
    hasAddPermission,
    hasEditPermission,
    isView,
    searchParamsValue,
    communityId,
    weeklyDate,
    monthlyDate,
    handleDailyAddShiftClick,
    handleShiftItemClick,
    handelSelectShift,
    statusClick,
    handleAddShiftClick,
    handleEmployeeDailyAddShiftClick,
    loadGetScheduleShiftDepartmentList,
    setHasUnpublishedRole,
    setHasUnpublishedEmloyee,
  } = props;

  const { localMoment } = useGlobalTime();

  if (currentView === "role") {
    switch (currentSchedule) {
      case "Daily":
        if (dailyDate) {
          return (
            <RoleViewDaily
              // ref={(ref) => {
              //   roleDaily.current = {
              //     ...roleDaily.current,
              //     [department.departmentId]: ref,
              //   };
              // }}
              key={dailyDate}
              selectShiftIds={selectShiftIds}
              onShiftSelect={handelSelectShift}
              onlyOverTime={checkedOverTime}
              onlyUnPublished={checkUnpublishedShifts}
              canAdd={!isView && hasAddPermission}
              canEdit={!isView && hasEditPermission}
              searchParamsValue={searchParamsValue}
              department={department}
              communityId={communityId}
              dayDate={dailyDate as string}
              onShiftItemClick={handleShiftItemClick}
              handleAddShiftClick={handleDailyAddShiftClick}
              statusClick={statusClick}
            />
          );
        }
        return;

      case "Weekly":
        if (weeklyDate?.from && weeklyDate?.to) {
          const weeklyDays = getWeekDays(
            weeklyDate?.from,
            weeklyDate?.to,
            "MM/DD/YYYY"
          ).map((value) => {
            const date = localMoment(value, "MM/DD/YYYY").format("DD");

            return {
              date: value,
              dayOfWeek: +date,
              dayOfWeekName: formatDate(value, "ddd", "MM/DD/YYYY"),
            };
          });

          return (
            <RoleViewWeekly
              // ref={(ref) => {
              //   roleWeekly.current = {
              //     ...roleWeekly.current,
              //     [department.departmentId]: ref,
              //   };
              // }}
              canAdd={!isView && hasAddPermission}
              canEdit={!isView && hasEditPermission}
              setHasUnpublished={setHasUnpublishedRole}
              onlyOverTime={checkedOverTime}
              onlyUnPublished={checkUnpublishedShifts}
              searchParamsValue={searchParamsValue}
              department={department}
              weeklyDays={weeklyDays}
              communityId={communityId}
              shiftStartDate={weeklyDate.from}
              shiftEndDate={weeklyDate.to}
              selectShiftIds={selectShiftIds}
              onShiftSelect={handelSelectShift}
              onShiftItemClick={handleShiftItemClick}
              handleAddShiftClick={handleAddShiftClick}
              refreshDepartment={loadGetScheduleShiftDepartmentList}
              statusClick={statusClick}
            />
          );
        }
        return;

      case "Monthly":
        if (monthlyDate) {
          const start = localMoment(monthlyDate, "MM/YYYY").startOf("month");
          const end = localMoment(monthlyDate, "MM/YYYY").endOf("month");
          const startDateOfMonth = start.startOf("week").format("MM/DD/YYYY");
          const endDateOfMonth = end.endOf("week").format("MM/DD/YYYY");

          const monthlyDays = getDaysInterval({
            start: startDateOfMonth,
            end: endDateOfMonth,
            dateFormat: "MM/DD/YYYY",
          }).map((day) => {
            return {
              day: localMoment(day).format("MM/DD/YYYY"),
              month: localMoment(day).format("MM/YYYY"),
            };
          });

          return (
            <RoleViewMonthly
              // ref={(ref) => {
              //   roleMonthly.current = {
              //     ...roleMonthly.current,
              //     [department.departmentId]: ref,
              //   };
              // }}
              key={dailyDate}
              canAdd={!isView && hasAddPermission}
              searchParamsValue={searchParamsValue}
              monthlyDays={monthlyDays}
              monthlyDate={monthlyDate}
              startDay={startDateOfMonth}
              endDay={endDateOfMonth}
              department={department}
              communityId={communityId}
              handleAddShiftClick={handleAddShiftClick}
            />
          );
        }
    }
  }

  if (currentView === "employee") {
    switch (currentSchedule) {
      case "Daily":
        if (dailyDate) {
          return (
            <>
              <EmployeeViewDaily
                // ref={(ref) => {
                //   employeeDaily.current = {
                //     ...employeeDaily.current,
                //     [department.departmentId]: ref,
                //   };
                // }}
                key={dailyDate}
                selectShiftIds={selectShiftIds}
                onShiftSelect={handelSelectShift}
                onlyOverTime={checkedOverTime}
                onlyUnPublished={checkUnpublishedShifts}
                canAdd={!isView && hasAddPermission}
                canEdit={!isView && hasEditPermission}
                searchParamsValue={searchParamsValue}
                department={department}
                communityId={communityId}
                dayDate={dailyDate}
                onShiftItemClick={handleShiftItemClick}
                handleAddShiftClick={handleEmployeeDailyAddShiftClick}
                statusClick={statusClick}
              />
            </>
          );
        }
        return;

      case "Weekly":
        if (weeklyDate?.from && weeklyDate?.to) {
          const weeklyDays = getWeekDays(
            weeklyDate?.from,
            weeklyDate?.to,
            "MM/DD/YYYY"
          ).map((value) => {
            const { date } = getDateObject(value, "MM/DD/YYYY");
            return {
              date: value,
              dayOfWeek: +date,
              dayOfWeekName: formatDate(value, "ddd", "MM/DD/YYYY"),
            };
          });

          return (
            <EmployeeViewWeekly
              // ref={(ref) => {
              //   employeeWeekly.current = {
              //     ...employeeWeekly.current,
              //     [department.departmentId]: ref,
              //   };
              // }}
              setHasUnpublished={setHasUnpublishedEmloyee}
              selectShiftIds={selectShiftIds}
              onShiftSelect={handelSelectShift}
              onlyOverTime={checkedOverTime}
              onlyUnPublished={checkUnpublishedShifts}
              canAdd={!isView && hasAddPermission}
              canEdit={!isView && hasEditPermission}
              searchParamsValue={searchParamsValue}
              weeklyDays={weeklyDays}
              startDay={weeklyDate.from}
              endDay={weeklyDate.to}
              department={department}
              communityId={communityId}
              onShiftItemClick={handleShiftItemClick}
              handleAddShiftClick={handleAddShiftClick}
              refreshDepartment={loadGetScheduleShiftDepartmentList}
              statusClick={statusClick}
            />
          );
        }
        return;

      case "Monthly":
        if (monthlyDate) {
          const start = localMoment(monthlyDate, "MM/YYYY").startOf("month");
          const end = localMoment(monthlyDate, "MM/YYYY").endOf("month");
          const startDateOfMonth = start.startOf("week").format("MM/DD/YYYY");
          const endDateOfMonth = end.endOf("week").format("MM/DD/YYYY");

          const monthlyDays = getDaysInterval({
            start: startDateOfMonth,
            end: endDateOfMonth,
            dateFormat: "MM/DD/YYYY",
          }).map((day) => {
            return {
              day: localMoment(day).format("MM/DD/YYYY"),
              month: localMoment(day).format("MM/YYYY"),
            };
          });

          // const { shiftRoleViewVOS } = roleViewData.monthly;

          return (
            <EmployeeScheduleMonthly
              // ref={(ref) => {
              //   employeeMonthly.current = {
              //     ...employeeMonthly.current,
              //     [department.departmentId]: ref,
              //   };
              // }}
              selectShiftIds={selectShiftIds}
              onShiftSelect={handelSelectShift}
              canAdd={!isView && hasAddPermission}
              canEdit={!isView && hasEditPermission}
              startDay={startDateOfMonth}
              endDay={endDateOfMonth}
              department={department}
              searchParamsValue={searchParamsValue}
              communityId={communityId}
              monthlyDays={monthlyDays}
              monthlyDate={monthlyDate}
              onShiftItemClick={handleShiftItemClick}
              handleAddShiftClick={handleAddShiftClick}
            />
          );
        }
    }
  }
};

export default memo(ScheduleView);
