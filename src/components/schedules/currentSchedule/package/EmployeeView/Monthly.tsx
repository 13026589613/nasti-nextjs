import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useImmer } from "use-immer";
import { useShallow } from "zustand/react/shallow";

import { scheduleShiftListEmployee } from "@/api/currentSchedule";
import {
  DepartmentShiftVO,
  ScheduleShift,
  ScheduleUser,
} from "@/api/currentSchedule/types";
import Spin from "@/components/custom/Spin";
import CollapsiblePanel from "@/components/schedules/components/CollapsiblePanel";
import Header from "@/components/schedules/components/monthly/Header";
import ViewportContainer from "@/components/schedules/components/ViewportContainer";
import ViewRoleTags from "@/components/schedules/components/ViewRoleTags";
import { WeeklyDaysType } from "@/components/schedules/types/weekly";
import { formatDate } from "@/components/schedules/utils";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import { sortScheduleShiftList } from "@/utils/sortByKey";

import EmptyShift from "../components/emptyShift";
import ShiftItem from "../components/ShiftItem";

type ScheduleMonthlyProps = {
  canEdit?: boolean;
  canAdd?: boolean;
  department: DepartmentShiftVO;
  communityId: string;
  monthlyDays: {
    day: string;
    month: string;
  }[];
  monthlyDate: string;
  startDay: string;
  endDay: string;
  searchParamsValue: {
    locationIds: string[] | null;
    workerRoleIds: string[] | null;
    userIds: string[] | null;
    notAssigned: boolean;
  };
  selectShiftIds: string[];
  onShiftSelect: (shift: ScheduleShift) => void;
  onShiftItemClick: (shift: ScheduleShift, view: boolean) => void;
  handleAddShiftClick: (data: {
    userId: string;
    departmentId: string;
    weeklyDay: WeeklyDaysType;
  }) => void;
  statusClick?: (tag: number, shift: ScheduleShift) => void;
};

const EmployeeScheduleMonthly = forwardRef<any, ScheduleMonthlyProps>(
  (props, ref) => {
    const {
      canAdd = true,
      canEdit = true,
      monthlyDays,
      monthlyDate,
      communityId,
      department,
      startDay,
      endDay,
      searchParamsValue,
      selectShiftIds,
      onShiftItemClick,
      handleAddShiftClick,
      statusClick,
      onShiftSelect,
    } = props;

    const { localMoment, UTCMoment } = useGlobalTime();

    const [isLoading, setIsLoading] = useState(true);

    const isEnter = useRef(false);

    const [employeeViewData, setEmployeeViewData] = useImmer<ScheduleUser[]>(
      []
    );

    const [roleList, setRoleList] = useState<
      {
        name: string;
        color: string;
      }[]
    >([]);

    const handleEnter = () => {
      if (isEnter.current) return;
      if (department.departmentId) {
        loadGetScheduleShiftList();
      } else {
        isEnter.current = true;
      }
    };

    const loadGetScheduleShiftList = () => {
      isEnter.current = true;

      setIsLoading(true);

      scheduleShiftListEmployee<"Monthly">({
        communityId,
        departmentId: department.departmentId,
        type: "Monthly",
        shiftStartDate: startDay,
        shiftEndDate: endDay,
        scheduleId: department?.scheduleId ?? null,
        ...searchParamsValue,
      })
        .then(({ code, data }) => {
          if (code !== 200) return;
          if (data) {
            let roleList: {
              name: string;
              color: string;
            }[] = [];
            data.forEach((user) => {
              const { statistics } = user;
              if (statistics) {
                statistics.forEach((item) => {
                  item.shifts?.forEach((shift) => {
                    if (shift && shift.id) {
                      shift.shiftDate = UTCMoment(shift.startTimeUTC).format(
                        "MM/DD/YYYY"
                      );
                      shift.shiftStartTime = UTCMoment(
                        shift.startTimeUTC
                      ).format("hh:mm A");
                      shift.shiftEndTime = UTCMoment(shift.endTimeUTC).format(
                        "hh:mm A"
                      );
                    }

                    if (
                      !roleList.find(
                        (role) => role.name === shift.workerRoleName
                      )
                    ) {
                      roleList.push({
                        name: shift.workerRoleName,
                        color: shift.workerRoleColor,
                      });
                    }
                  });
                });
              } else {
                user.statistics = [
                  {
                    shiftDate: "",
                    shifts: [],
                  },
                ];
              }
              user.statistics = sortScheduleShiftList(
                user.statistics,
                "employee"
              );
            });
            setRoleList(roleList);
          }

          setEmployeeViewData(data || []);
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
      if (!department.departmentId) return;
      loadGetScheduleShiftList();
    }, [startDay, endDay, searchParamsValue, department]);

    useImperativeHandle(ref, () => ({
      refresh: () => {
        loadGetScheduleShiftList();
      },
    }));

    return (
      <ViewportContainer onEnter={handleEnter}>
        <Spin loading={isLoading}>
          <div className="relative">
            <ViewRoleTags roleList={roleList} />
            <Header />
            {employeeViewData.map((user) => {
              let shifts: ScheduleShift[] = [];
              if (user.statistics) {
                user.statistics.forEach((item) => {
                  shifts = shifts.concat(item.shifts);
                });
              }

              return (
                <CollapsiblePanel
                  key={user.userId}
                  title={user.userName}
                  roleColor="#F4F4F5"
                  defaultOpen
                  isShowAddButton={false}
                >
                  <div className="border-[1px] border-[#E7EDF1] mt-[8px] flex flex-wrap">
                    {monthlyDays.map(({ day, month }) => {
                      const isBeforeToday = localMoment(day).isBefore(
                        localMoment(),
                        "day"
                      );

                      const statistic = user.statistics?.find(
                        (item) => item.shiftDate === day
                      );

                      return (
                        <div
                          key={day}
                          className="flex-[1_0_14.28%] min-w-[182px] border-r-[1px] border-b-[1px] border-[#E7EDF1] relative min-h-[95px]"
                        >
                          <div className="p-[22px_25px_22px_15px] relative h-full">
                            <div
                              className={cn(
                                "absolute top-[2px] right-[4px] text-[14px] text-[#919FB4]",
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
                                    userId: user.userId,
                                    weeklyDay: {
                                      dayOfWeek: new Date(day).getDay(),
                                      dayOfWeekName:
                                        localMoment(day).format("MM/DD/YYYY"),
                                      date: localMoment(day).format(
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
                            {statistic?.shifts?.map((item, index) => {
                              return (
                                <ShiftItemBox
                                  key={index + "empty" + day}
                                  index={index}
                                  id={index + "empty" + day}
                                  day={day}
                                  item={item}
                                  canEdit={canEdit}
                                  selectShiftIds={selectShiftIds}
                                  onShiftSelect={onShiftSelect}
                                  onShiftItemClick={onShiftItemClick}
                                  statusClick={statusClick}
                                ></ShiftItemBox>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsiblePanel>
              );
            })}
          </div>
        </Spin>
      </ViewportContainer>
    );
  }
);

EmployeeScheduleMonthly.displayName = "EmployeeScheduleMonthly";

export default memo(EmployeeScheduleMonthly);

const ShiftItemBox = ({
  index,
  day,
  item,
  id,
  canEdit,
  selectShiftIds,
  onShiftSelect,
  onShiftItemClick,
  statusClick,
}: {
  id: string;
  canEdit: boolean;
  index: number;
  day: string;
  item: ScheduleShift;
  selectShiftIds: string[];
  onShiftSelect: (shift: ScheduleShift) => void;
  onShiftItemClick: (shift: ScheduleShift, view: boolean) => void;
  statusClick?: (tag: number, shift: ScheduleShift) => void;
}) => {
  const {
    isPublished,
    checkoutTime,
    checkinTime,
    tags,
    startTimeUTC,
    endTimeUTC,
  } = item;

  const { localMoment, UTCMoment } = useGlobalTime();

  const { navbarWidth } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const isNotPublished = !isPublished && !tags?.includes(4);

  const isShiftStart = localMoment().isSameOrAfter(
    UTCMoment(item.startTimeUTC),
    "minute"
  );
  let isClickView = !canEdit || isShiftStart || checkinTime || checkoutTime;

  const isCrossDayStart = UTCMoment(startTimeUTC).isBefore(
    localMoment(day, "MM/DD/YYYY"),
    "day"
  );

  const isCrossDayEnd = UTCMoment(endTimeUTC).isAfter(
    localMoment(day, "MM/DD/YYYY"),
    "day"
  );

  const width = useMemo(() => {
    if (navbarWidth <= 1330) {
      return (1330 - 150) / 7;
    }
    return (navbarWidth - 175) / 7;
  }, [navbarWidth]);

  return (
    <div
      style={
        item.isCrossDayStart
          ? {
              width: width * 2,
            }
          : {}
      }
    >
      {item?.isShowEmpty && (
        <EmptyShift index={index} id={id} date={day as string}></EmptyShift>
      )}
      {!item?.isShowEmpty && (
        <ShiftItem
          type="small"
          shift={item}
          canEdit={canEdit}
          selectShiftIds={selectShiftIds}
          onSelectShiftId={onShiftSelect}
          onClick={() => {
            onShiftItemClick(item, isClickView);
          }}
          isShowWarning={false}
          notPublished={isNotPublished}
          statusClick={(tag) => {
            if (canEdit) {
              statusClick && statusClick(tag, item);
            }
          }}
          isCrossDayEnd={isCrossDayEnd}
          isCrossDayStart={isCrossDayStart}
        />
      )}
    </div>
  );
};
