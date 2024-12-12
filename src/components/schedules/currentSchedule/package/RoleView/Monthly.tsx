import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useImmer } from "use-immer";

import { scheduleShiftList } from "@/api/currentSchedule";
import {
  Chooses,
  DepartmentShiftVO,
  MonthlyRoleVO,
} from "@/api/currentSchedule/types";
import Spin from "@/components/custom/Spin";
import BoxContainer from "@/components/schedules/components/monthly/BoxContainer";
import Container from "@/components/schedules/components/monthly/Container";
import Header from "@/components/schedules/components/monthly/Header";
import ViewportContainer from "@/components/schedules/components/ViewportContainer";
import ViewRoleTags from "@/components/schedules/components/ViewRoleTags";
import { WeeklyDaysType } from "@/components/schedules/types/weekly";
import { formatDate, getDateString } from "@/components/schedules/utils";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";

import ViewRadio from "../../ViewRadio";

type ScheduleMonthlyProps = {
  canAdd?: boolean;
  department: DepartmentShiftVO;
  communityId: string;
  startDay: string;
  endDay: string;
  monthlyDays: {
    day: string;
    month: string;
  }[];
  monthlyDate: string;
  searchParamsValue: {
    locationIds: string[] | null;
    workerRoleIds: string[] | null;
    userIds: string[] | null;
    notAssigned: boolean;
  };
  handleAddShiftClick: (data: {
    departmentId: string;
    weeklyDay: WeeklyDaysType;
  }) => void;
};

const ScheduleMonthly = forwardRef<any, ScheduleMonthlyProps>((props, ref) => {
  const {
    canAdd = true,
    monthlyDays,
    monthlyDate,
    department,
    communityId,
    startDay,
    endDay,
    searchParamsValue,
    handleAddShiftClick,
  } = props;

  const { localMoment } = useGlobalTime();

  const [isLoading, setIsLoading] = useState(true);

  const [radioValue, setRadioValue] = useState<Chooses>("Hours");

  const isEnter = useRef(false);

  const [roleViewData, setRoleViewData] = useImmer<MonthlyRoleVO[]>([]);

  const handleEnter = () => {
    if (isEnter.current) return;
    loadGetScheduleShiftList(radioValue);
  };

  const [roleList, setRoleList] = useState<
    {
      name: string;
      color: string;
    }[]
  >([]);

  const loadGetScheduleShiftList = (chooses: string) => {
    isEnter.current = true;

    setIsLoading(true);

    scheduleShiftList<"Monthly">({
      communityId,
      departmentId: department.departmentId,
      type: "Monthly",
      shiftStartDate: startDay,
      shiftEndDate: endDay,
      chooses: chooses as Chooses,
      scheduleId: department?.scheduleId ?? null,
      ...searchParamsValue,
    })
      .then(({ code, data }) => {
        if (code !== 200) return;
        let roleList: {
          name: string;
          color: string;
        }[] = [];
        data.forEach((item) => {
          item.roleVOS?.forEach((role) => {
            if (!roleList.some((r) => r.name === role.roleName)) {
              roleList.push({
                name: role.roleName,
                color: role.roleColor,
              });
            }
          });
        });
        setRoleList(roleList);
        setRoleViewData((data || []) as any);
      })
      .catch(() => {
        isEnter.current = false;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!isEnter.current) return;
    loadGetScheduleShiftList(radioValue);
  }, [startDay, endDay, searchParamsValue, department]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      loadGetScheduleShiftList(radioValue);
    },
  }));

  return (
    <ViewportContainer onEnter={handleEnter}>
      <Spin loading={isLoading}>
        <div className="relative">
          <div className="flex items-center gap-[50px] flex-wrap h-[40px] mt-3">
            <ViewRadio
              className="flex my-0"
              id={department.departmentId}
              value={radioValue}
              isShowHPPD={department.isHppd}
              onChange={(value) => {
                setRadioValue(value as Chooses);
                loadGetScheduleShiftList(value);
              }}
              hourName="Assigned over Planned Hours"
              hppdName="Assigned over Planned HPPD"
            />
          </div>

          <ViewRoleTags roleList={roleList} />
          <Header />

          <Container>
            {monthlyDays.map(({ day, month }) => {
              const isBeforeToday = localMoment(day, "MM/DD/YYYY").isBefore(
                localMoment(),
                "day"
              );
              return (
                <BoxContainer key={day}>
                  <div className="p-[15px_35px_15px_15px] relative h-full">
                    <div
                      className={cn(
                        "absolute top-[10px] right-[10px] text-[#919FB4]",
                        {
                          "text-[#324664]": monthlyDate === month,
                          "text-primary": localMoment().isSame(
                            localMoment(day, "MM/DD/YYYY"),
                            "day"
                          ),
                        }
                      )}
                    >
                      {formatDate(day, "DD", "MM/DD/YYYY")}
                    </div>

                    {canAdd && !isBeforeToday && (
                      <div
                        onClick={() => {
                          handleAddShiftClick({
                            departmentId: department.departmentId,
                            weeklyDay: {
                              dayOfWeek: new Date(day).getDay(),
                              dayOfWeekName: localMoment(
                                day,
                                "MM/DD/YYYY"
                              ).format("MM/DD/YYYY"),
                              date: localMoment(day, "MM/DD/YYYY").format(
                                "MM/DD/YYYY"
                              ),
                            },
                          });
                        }}
                        className="absolute bottom-[5px] right-[9px] font-[700] text-[24px] text-primary cursor-pointer"
                      >
                        +
                      </div>
                    )}

                    {roleViewData
                      ?.filter(
                        (roleView) =>
                          getDateString(roleView.time, "MM/DD/YYYY") === day
                      )

                      .map((item) => {
                        return (
                          <div key={item.time} className="h-full relative pb-4">
                            {item?.roleVOS?.map((role, index) => {
                              let text = "";
                              let color = "#324664";
                              let reactDom = <></>;
                              if (radioValue === "Hours") {
                                if (role.hours) {
                                  const assignedHours = isNaN(
                                    role.assignedHours
                                  )
                                    ? "0"
                                    : role.assignedHours.toFixed(2);
                                  const plannedHours = isNaN(role.hours)
                                    ? "0 hours"
                                    : role.hours.toFixed(2) + " hours";
                                  text = `${assignedHours} / ${plannedHours}`;
                                } else {
                                  text = "0 hours / 0 hours";
                                }
                              } else {
                                const newRole: any = JSON.parse(
                                  JSON.stringify(role)
                                );
                                const assignedHPPD =
                                  newRole?.assignedHPPD !== null
                                    ? newRole?.assignedHPPD?.toFixed(2) + ""
                                    : "-";
                                const plannedHPPD =
                                  newRole?.plannedHPPD !== null
                                    ? newRole?.plannedHPPD?.toFixed(2) + ""
                                    : "-";

                                if (
                                  assignedHPPD === "-" ||
                                  plannedHPPD === "-"
                                ) {
                                  text = "-";
                                  reactDom = <>-</>;
                                } else {
                                  reactDom = (
                                    <div>
                                      <span
                                        style={{
                                          color:
                                            newRole?.targetHPPD &&
                                            newRole?.targetHPPD >
                                              newRole?.assignedHPPD
                                              ? "#D35445"
                                              : "#324664",
                                        }}
                                      >
                                        {assignedHPPD}
                                      </span>
                                      {" / "}{" "}
                                      <span
                                        style={{
                                          color:
                                            newRole?.targetHPPD &&
                                            newRole?.targetHPPD >
                                              newRole?.plannedHPPD
                                              ? "#D35445"
                                              : "#324664",
                                        }}
                                      >
                                        {plannedHPPD}
                                      </span>
                                    </div>
                                  );
                                }
                              }

                              return (
                                <div key={role.roleId}>
                                  <div className="border-[1px] border-[#E7EDF1] w-full mt-[4px] flex flex-col justify-center items-center p-[5px_0] hover:border-primary transition-colors duration-300 rounded-[4px] h-[73px]">
                                    <div
                                      className="font-[700] w-full whitespace-nowrap overflow-hidden text-ellipsis text-center"
                                      style={{
                                        color: role.roleColor,
                                      }}
                                    >
                                      {role.roleName}
                                    </div>
                                    <div
                                      className="text-[#324664]"
                                      style={{
                                        color,
                                      }}
                                    >
                                      {radioValue === "Hours" ? text : reactDom}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                  </div>
                </BoxContainer>
              );
            })}
          </Container>
        </div>
      </Spin>
    </ViewportContainer>
  );
});

ScheduleMonthly.displayName = "ScheduleMonthly";

export default ScheduleMonthly;
