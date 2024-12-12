import { useSetState } from "ahooks";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useImmer } from "use-immer";

import {
  departmentScheduleRoles,
  scheduleShiftEdit,
  scheduleShiftListEmployee,
} from "@/api/currentSchedule";
import {
  DepartmentShiftVO,
  ScheduleShift,
  ScheduleUser,
} from "@/api/currentSchedule/types";
import PublishShiftErrorDia from "@/app/(system)/(service)/currentSchedule/components/PublishShiftErrorDia";
import Spin from "@/components/custom/Spin";
import CollapsiblePanel from "@/components/schedules/components/CollapsiblePanel";
import CurrentTimeline from "@/components/schedules/components/daily/CurrentTimeline";
import Header from "@/components/schedules/components/daily/Header";
import ShiftContainer, {
  onDragStopCallback,
  onResizeStopCallback,
} from "@/components/schedules/components/daily/ShiftContainer";
import ViewportContainer from "@/components/schedules/components/ViewportContainer";
import ViewRoleTags from "@/components/schedules/components/ViewRoleTags";
import useDayViewWidth from "@/components/schedules/hooks/useDayViewWidth";
import RowContainer from "@/components/schedules/templateSchedule/package/shiftTimeLine/components/RowContainer";
import { isRedBg } from "@/components/schedules/utils";
import { formatDate } from "@/components/schedules/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { MESSAGE } from "@/constant/message";
import { EXCEPTION_REASON } from "@/constant/statusConstants";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";

import ViewNoData from "../../ViewNoData";
import DailyAttendeeStatus from "../components/DailyAttendeeStatus";
import DailyStatusIcon from "../components/DailyStatusIcon";

interface RoleViewDailyProps {
  onlyOverTime?: boolean;
  onlyUnPublished?: boolean;
  canEdit?: boolean;
  canAdd?: boolean;
  dayDate: string;
  department: DepartmentShiftVO;
  communityId: string;
  searchParamsValue: {
    locationIds: string[] | null;
    workerRoleIds: string[] | null;
    userIds: string[] | null;
    notAssigned: boolean;
  };
  selectShiftIds: string[];
  onShiftSelect: (shift: ScheduleShift) => void;
  onShiftItemClick: (shift: ScheduleShift, view: boolean) => void;
  handleAddShiftClick: (data: { departmentId: string; userId: string }) => void;
  statusClick?: (tag: number, shift: ScheduleShift) => void;
}

const dayHours = [
  "12AM",
  "1AM",
  "2AM",
  "3AM",
  "4AM",
  "5AM",
  "6AM",
  "7AM",
  "8AM",
  "9AM",
  "10AM",
  "11AM",
  "12PM",
  "1PM",
  "2PM",
  "3PM",
  "4PM",
  "5PM",
  "6PM",
  "7PM",
  "8PM",
  "9PM",
  "10PM",
  "11PM",
];

const RoleViewDaily = forwardRef<any, RoleViewDailyProps>((props, ref) => {
  const {
    canAdd = true,
    canEdit = true,
    onlyOverTime,
    onlyUnPublished,
    department,
    communityId,
    dayDate,
    searchParamsValue,
    selectShiftIds,
    onShiftSelect,
    onShiftItemClick,
    handleAddShiftClick,
    statusClick,
  } = props;
  const { localMoment, UTCMoment } = useGlobalTime();

  const isDisabled = useMemo(() => {
    return localMoment(dayDate, "MM/DD/YYYY").isBefore(localMoment(), "day");
  }, [dayDate]);

  const [employeeViewData, setEmployeeViewData] = useImmer<ScheduleUser[]>([]);

  const isEnter = useRef(false);

  const [isLoading, setIsLoading] = useState(true);

  const wrapperRef = useRef(null);

  const { wrapperWidth, contentWidth, hourWidth } = useDayViewWidth(wrapperRef);

  const getIsShowCurrentTimeline = useMemo(() => {
    const currentDate = localMoment().format("MM/DD/YYYY");
    return currentDate === dayDate;
  }, [dayDate]);

  // Used to generate shift arrays into multidimensional arrays with multiple rows.
  // result：[[shift1, shift2], [shift3, shift4], [shift5, shift6]]
  const getRowsByShifts = useCallback((shifts: ScheduleShift[]) => {
    let copyShifts = [...shifts];

    copyShifts = copyShifts.filter((shift) => {
      return shift.id;
    });
    /*
      Sorting rules:
      If there is no userName (OPEN), it is on top.
      If there is a userName, sort by userName.
    */
    copyShifts.sort((a, b) => {
      const AStartTime = UTCMoment(a.startTimeUTC).format("x");
      const BStartTime = UTCMoment(b.startTimeUTC).format("x");
      if (AStartTime < BStartTime) {
        return -1;
      } else if (AStartTime > BStartTime) {
        return 1;
      } else {
        if (a.workerRoleName && b.workerRoleName) {
          return a.workerRoleName.localeCompare(b.workerRoleName);
        } else if (a.workerRoleName && !b.workerRoleName) {
          return 1;
        } else if (!a.workerRoleName && b.workerRoleName) {
          return -1;
        } else if (!a.workerRoleName && !b.workerRoleName) {
          return a.id.localeCompare(b.id);
        }
      }

      return 0;
    });

    let shiftRows: Array<ScheduleShift[]> = [[]];

    copyShifts.forEach((shift) => {
      let placed = false;
      for (let row of shiftRows) {
        let hasConflict = row.some((s) => {
          const SStartTime = Number(UTCMoment(s.startTimeUTC).format("x"));
          const SEndTime = Number(UTCMoment(s.endTimeUTC).format("x"));
          const shiftStartTime = Number(
            UTCMoment(shift.startTimeUTC).format("x")
          );
          const shiftEndTime = Number(UTCMoment(shift.endTimeUTC).format("x"));

          return (
            (SStartTime < shiftEndTime && SStartTime >= shiftStartTime) ||
            (SEndTime > shiftStartTime && SEndTime <= shiftEndTime) ||
            (shiftStartTime < SEndTime && shiftStartTime >= SStartTime) ||
            (shiftEndTime > shiftStartTime && shiftEndTime <= SEndTime)
          );
        });

        if (!hasConflict) {
          row.push(shift);
          placed = true;
          break;
        }
      }

      if (!placed) {
        shiftRows.push([shift]);
      }
    });

    return shiftRows;
  }, []);

  const loadGetScheduleShiftList = () => {
    isEnter.current = true;

    setIsLoading(true);

    scheduleShiftListEmployee<"Daily">({
      onlyOverTime,
      onlyUnPublished,
      communityId,
      departmentId: department.departmentId,
      type: "Daily",
      shiftStartDate: dayDate,
      shiftEndDate: null,
      scheduleId: department?.scheduleId ?? null,
      ...searchParamsValue,
    })
      .then(({ code, data }) => {
        if (code !== 200) return;
        data.forEach((item) => {
          const { statistics } = item;
          if (statistics) {
            statistics.map((item) => {
              item.shifts?.forEach((shift) => {
                if (shift && shift.id) {
                  shift.shiftDate = UTCMoment(shift.startTimeUTC).format(
                    "MM/DD/YYYY"
                  );
                  shift.shiftStartTime = UTCMoment(shift.startTimeUTC).format(
                    "hh:mm A"
                  );
                  shift.shiftEndTime = UTCMoment(shift.endTimeUTC).format(
                    "hh:mm A"
                  );
                }
              });
            });
          } else {
            item.statistics = [
              {
                shiftDate: "",
                shifts: [],
              },
            ];
          }
        });
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
    if (!department?.scheduleId) return;
    loadGetScheduleShiftList();
  }, [dayDate, searchParamsValue, department, onlyOverTime, onlyUnPublished]);

  const handleEnter = () => {
    if (isEnter.current) return;
    if (!department?.scheduleId) {
      setIsLoading(false);
      isEnter.current = true;
      return;
    }
    loadGetScheduleShiftList();
  };

  const [roleList, setRoleList] = useState<
    {
      name: string;
      color: string;
    }[]
  >([]);

  const getRoles = async () => {
    setIsLoading(true);
    try {
      const res = await departmentScheduleRoles({
        departmentId: department.departmentId,
        scheduleId: department?.scheduleId as string,
        communityId,
      });
      if (res.code === 200) {
        setRoleList(
          res.data.map((item) => ({ name: item.name, color: item.color }))
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (department?.scheduleId) {
      getRoles();
    }
  }, [department]);

  const updateScheduleShift = (
    shift: ScheduleShift,
    isConfirm: boolean = false
  ) => {
    const {
      id,
      communityId,
      scheduleId,
      departmentId,
      locationRefVOs,
      workerRoleId,
      userId,
      shiftDate,
      note,
      shiftStartTime,
      shiftEndTime,
    } = shift;

    if (isConfirm) {
      setPublishErrorConfirm({
        loading: true,
      });
    }

    let params: any = {
      id,
      communityId,
      scheduleId,
      departmentId,
      shiftDate: [shiftDate],
      locationIds: locationRefVOs?.map((location) => location.locationId),
      workerRoleId,
      userId,
      note,
      shiftStartTime,
      shiftEndTime,
    };

    if (shift.isPublished) {
      params.published = true;
    }

    if (shift?.tags?.includes(4)) {
      params.published = true;
    }

    if (isConfirm) {
      params.confirmPublish = true;
    }

    let isSuccess = false;

    scheduleShiftEdit(params)
      .then(({ code, data }) => {
        if (code !== 200) {
          isSuccess = true;
          loadGetScheduleShiftList();
          return;
        }
        if (data.isSuccess) {
          isSuccess = true;
          toast.success(MESSAGE.edit, {
            position: "top-center",
          });
          if (isConfirm) {
            setPublishErrorConfirm({
              visible: false,
            });
          }
          loadGetScheduleShiftList();
        } else {
          isSuccess = true;
          setPublishErrorConfirm({
            visible: true,
            validateMsg: data.validateMsg,
            data: shift,
          });
        }
      })
      .finally(() => {
        if (!isSuccess) {
          loadGetScheduleShiftList();
        }
        if (isConfirm) {
          setPublishErrorConfirm({
            loading: false,
          });
        }
      });
  };

  const handleDragStop: onDragStopCallback<ScheduleShift> = (
    { newStartTime, newEndTime },
    shift
  ) => {
    const newStartDay = formatDate(
      newStartTime,
      "MM/DD/YYYY",
      "MM/DD/YYYY HH:mm"
    );

    const newStartTimeDate = formatDate(
      newStartTime,
      "hh:mm A",
      "MM/DD/YYYY HH:mm"
    );
    const newEndTimeDate = formatDate(
      newEndTime,
      "hh:mm A",
      "MM/DD/YYYY HH:mm"
    );

    updateScheduleShift({
      ...shift,
      shiftDate: newStartDay,
      shiftStartTime: newStartTimeDate,
      shiftEndTime: newEndTimeDate,
    });
  };

  const handleResizeStop: onResizeStopCallback<ScheduleShift> = (
    { newStartTime, newEndTime },
    shift
  ) => {
    const newStartTimeDate = formatDate(
      newStartTime,
      "hh:mm A",
      "MM/DD/YYYY HH:mm"
    );
    const newEndTimeDate = formatDate(
      newEndTime,
      "hh:mm A",
      "MM/DD/YYYY HH:mm"
    );

    updateScheduleShift({
      ...shift,
      shiftStartTime: newStartTimeDate,
      shiftEndTime: newEndTimeDate,
    });
  };

  useImperativeHandle(ref, () => ({
    refresh: () => {
      loadGetScheduleShiftList();
    },
  }));

  const [publishErrorConfirm, setPublishErrorConfirm] = useSetState({
    visible: false,
    loading: false,
    validateMsg: [] as string[],
    data: null as ScheduleShift | null,
  });

  return (
    <ViewportContainer onEnter={handleEnter}>
      <Spin loading={isLoading}>
        <div ref={wrapperRef}>
          {!!wrapperWidth && (
            <>
              {department?.scheduleId && <ViewRoleTags roleList={roleList} />}

              <div className="relative border-[1px] border-[#E7EDF1]">
                {getIsShowCurrentTimeline && (
                  <CurrentTimeline
                    contentWidth={contentWidth}
                    hourWidth={hourWidth}
                  />
                )}

                <Header dayHours={dayHours} contentWidth={contentWidth} />
                <div>
                  {department?.scheduleId ? (
                    <>
                      {employeeViewData?.map((user) => {
                        const shift = user.statistics[0].shifts.find(
                          (item) => item.tags && item.tags?.includes(3)
                        );

                        return (
                          <CollapsiblePanel
                            key={user.userId}
                            title={user.userName}
                            roleColor="#F4F4F5"
                            defaultOpen
                            isShowAddButton={canAdd && !isDisabled}
                            onAddShiftClick={() => {
                              handleAddShiftClick({
                                departmentId: department.departmentId,
                                userId: user.userId,
                              });
                            }}
                            beforeTitle={
                              <>
                                {shift ? (
                                  <div className="mr-3">
                                    <OvertimeIcon width="18px"></OvertimeIcon>
                                  </div>
                                ) : null}
                              </>
                            }
                          >
                            {getRowsByShifts(user.statistics[0].shifts).map(
                              (row, i) => {
                                return (
                                  <div
                                    key={i}
                                    className=" border-b-[1px] border-b-[#e6edf1]"
                                  >
                                    <RowContainer width={contentWidth}>
                                      {row.map((shift) => {
                                        const isDisabled = UTCMoment(
                                          shift.startTimeUTC
                                        ).isSameOrBefore(
                                          localMoment(),
                                          "minute"
                                        );

                                        return (
                                          <ShiftItem
                                            dayDate={dayDate}
                                            key={shift.id}
                                            shift={shift}
                                            isDisabled={isDisabled}
                                            hourWidth={hourWidth}
                                            canEdit={canEdit}
                                            selectShiftIds={selectShiftIds}
                                            onShiftSelect={onShiftSelect}
                                            onShiftItemClick={onShiftItemClick}
                                            statusClick={statusClick}
                                            handleDragStop={handleDragStop}
                                            handleResizeStop={handleResizeStop}
                                          ></ShiftItem>
                                        );
                                      })}
                                    </RowContainer>
                                  </div>
                                );
                              }
                            )}
                          </CollapsiblePanel>
                        );
                      })}
                    </>
                  ) : !department?.isTemplateExist ? (
                    <>
                      <ViewNoData
                        className="pt-[95px]"
                        textList={["No schedule for this week yet."]}
                        showBtn={false}
                      />
                    </>
                  ) : (
                    <>
                      <ViewNoData
                        className="pt-[150px]"
                        textList={["No schedule for this week yet."]}
                        showBtn={false}
                      />
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Spin>
      <PublishShiftErrorDia
        publishErrorConfirm={publishErrorConfirm}
        setPublishErrorConfirm={setPublishErrorConfirm}
        refresh={() => {
          loadGetScheduleShiftList();
        }}
        callBack={() => {
          if (publishErrorConfirm.data) {
            updateScheduleShift(publishErrorConfirm.data, true);
          }
        }}
      ></PublishShiftErrorDia>
    </ViewportContainer>
  );
});

RoleViewDaily.displayName = "RoleViewDaily";

export default RoleViewDaily;

const ShiftItem = (props: {
  shift: ScheduleShift;
  hourWidth: number;
  canEdit: boolean;
  isDisabled: boolean;
  selectShiftIds: string[];
  dayDate: string;
  onShiftSelect: (shift: ScheduleShift) => void;
  onShiftItemClick: (shift: ScheduleShift, view: boolean) => void;
  statusClick?: (tag: number, shift: ScheduleShift) => void;
  handleDragStop: onDragStopCallback<any>;
  handleResizeStop: onResizeStopCallback<any>;
}) => {
  const {
    shift,
    hourWidth,
    isDisabled,
    canEdit,
    selectShiftIds,
    dayDate,
    onShiftSelect,
    onShiftItemClick,
    handleDragStop,
    handleResizeStop,
    statusClick,
  } = props;

  const { attendanceEnabled } = useGlobalCommunityId();

  const { localMoment, UTCMoment, zoneAbbr } = useGlobalTime();

  const {
    workerRoleColor,
    workerRoleName,
    id,
    isPublished,
    startTimeUTC,
    attendeeStatus,
    userName,
    checkinTime,
    checkoutTime,
  } = shift;

  const tags = shift.tags || [];

  const isNotPublished = !isPublished && !tags?.includes(4);

  const isShowAttendeeStatus =
    !attendeeStatus &&
    localMoment().isAfter(UTCMoment(startTimeUTC)) &&
    isPublished &&
    attendanceEnabled &&
    userName;

  let title = `${userName ?? "OPEN"} ${shift.shiftStartTime} - ${
    shift.shiftEndTime
  } (${zoneAbbr}) `;

  if (userName && isPublished && attendanceEnabled) {
    title += `${
      attendeeStatus
        ? EXCEPTION_REASON[
            attendeeStatus.includes("BREAK_TIME")
              ? "BREAK_TIME_EXCEPTION"
              : attendeeStatus
          ]
        : ""
    }`;
  }

  if (isShowAttendeeStatus) {
    title += "Not Checked In";
  }

  const isShiftStart = localMoment().isSameOrAfter(
    UTCMoment(startTimeUTC),
    "minute"
  );

  const isClickView =
    !canEdit || isShiftStart || checkinTime || checkoutTime || isDisabled;

  const redBg =
    attendanceEnabled &&
    (isRedBg(shift, isShowAttendeeStatus) || isShowAttendeeStatus);

  return (
    <ShiftContainer<ScheduleShift>
      title={title}
      key={shift.id}
      redBg={redBg}
      isPurple={tags.includes(4)}
      shift={shift}
      hourWidth={hourWidth}
      startTime={UTCMoment(shift.startTimeUTC).format("MM/DD/YYYY HH:mm")}
      endTime={UTCMoment(shift.endTimeUTC).format("MM/DD/YYYY HH:mm")}
      dayDate={dayDate}
      enabled={!isClickView}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onClick={() => {
        onShiftItemClick(shift, isClickView);
      }}
      isWarning={tags.includes(3)}
      isNotPublished={isNotPublished}
    >
      {(showStartTime, showEndTime, isDragging, { width, isLeftCrossDay }) => {
        const isChecked = (selectShiftIds ?? []).includes(id);
        const isBefore = UTCMoment(startTimeUTC).isSameOrBefore(
          localMoment(),
          "minute"
        );
        const isShowCheckbox = !isBefore && canEdit;
        return (
          <div
            className={cn("w-full relative pl-[20px]", {
              flex: isLeftCrossDay,
              "justify-end": isLeftCrossDay,
            })}
          >
            {isShowCheckbox && (
              <div
                className={cn(
                  "absolute left-[10px] mt-[6px] items-center justify-center flex"
                )}
              >
                <Checkbox
                  className="bg-white"
                  checked={isChecked}
                  onClick={(e) => {
                    e.stopPropagation();
                    onShiftSelect && onShiftSelect(shift);
                  }}
                />
              </div>
            )}
            <div
              className="flex"
              style={{
                width: width ?? "100%",
              }}
            >
              <div className="max-w-full flex items-center mx-auto gap-[10px]">
                <div className=" flex-shrink-0 ml-[10px] text-center leading-[30px] text-ellipsis overflow-hidden">
                  <span
                    style={{
                      color: workerRoleColor,
                    }}
                  >
                    {workerRoleName}
                  </span>
                </div>
                <div className="text-center leading-[30px] text-ellipsis overflow-hidden">
                  <span>
                    {formatDate(showStartTime, "hh:mm A", "MM/DD/YYYY HH:mm")}
                    &nbsp;-&nbsp;{" "}
                    {`${formatDate(
                      showEndTime,
                      "hh:mm A",
                      "MM/DD/YYYY HH:mm"
                    )} (${zoneAbbr})`}
                  </span>
                </div>
                {attendeeStatus && userName && isPublished && (
                  <DailyAttendeeStatus
                    attendeeStatus={
                      attendeeStatus.includes("BREAK_TIME")
                        ? "BREAK_TIME_EXCEPTION"
                        : attendeeStatus
                    }
                  ></DailyAttendeeStatus>
                )}
                {isShowAttendeeStatus && (
                  <DailyAttendeeStatus
                    attendeeStatus={"NOT_CHECKED_IN"}
                  ></DailyAttendeeStatus>
                )}
                <DailyStatusIcon
                  tags={tags}
                  onClick={(tag) => {
                    if (canEdit && !isDragging && !isDisabled) {
                      statusClick && statusClick(tag, shift);
                    }
                  }}
                ></DailyStatusIcon>
              </div>
            </div>
          </div>
        );
      }}
    </ShiftContainer>
  );
};
