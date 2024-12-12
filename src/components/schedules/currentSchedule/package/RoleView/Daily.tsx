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
  departmentCensusEdit,
  departmentCensusList,
  scheduleShiftEdit,
  scheduleShiftList,
  shiftTargetHppdAdjust,
} from "@/api/currentSchedule";
import {
  Chooses,
  DepartmentCensusListRes,
  DepartmentShiftVO,
  ScheduleRole,
  ScheduleShift,
  ShiftTargetHppdAdjustParams,
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
import { hexToRgba, isBlackRange } from "@/utils/hexToRgba";

import TargetHPPD from "../../TargetHPPD";
import ViewCensus from "../../ViewCensus";
import ViewNoData from "../../ViewNoData";
import ViewRadio from "../../ViewRadio";
import DailyAttendeeStatus from "../components/DailyAttendeeStatus";
import DailyStatusIcon from "../components/DailyStatusIcon";

interface RoleViewDailyProps {
  department: DepartmentShiftVO;
  communityId: string;
  onlyOverTime?: boolean;
  onlyUnPublished?: boolean;
  dayDate: string;
  selectShiftIds: string[];
  onShiftSelect: (shift: ScheduleShift) => void;
  onShiftItemClick: (shift: ScheduleShift, view: boolean) => void;
  handleAddShiftClick: (data: {
    departmentId: string;
    workerRoleId: string;
  }) => void;
  searchParamsValue: {
    locationIds: string[] | null;
    workerRoleIds: string[] | null;
    userIds: string[] | null;
    notAssigned: boolean;
  };
  canEdit?: boolean;
  canAdd?: boolean;
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
    department,
    communityId,
    dayDate,
    searchParamsValue,
    selectShiftIds,
    onShiftSelect,
    onlyOverTime,
    onlyUnPublished,
    onShiftItemClick,
    handleAddShiftClick,
    statusClick,
  } = props;

  const { attendanceEnabled } = useGlobalCommunityId();

  const { localMoment, UTCMoment } = useGlobalTime();

  const isDisabled = useMemo(() => {
    return localMoment(dayDate, "MM/DD/YYYY").isBefore(localMoment(), "day");
  }, [dayDate]);

  const wrapperRef = useRef(null);

  const { wrapperWidth, contentWidth, hourWidth } = useDayViewWidth(wrapperRef);

  const getIsShowCurrentTimeline = useMemo(() => {
    const currentDate = localMoment().format("MM/DD/YYYY");
    return currentDate === dayDate;
  }, [dayDate]);

  // Used to generate shift arrays into multidimensional arrays with multiple rows.
  // result：[[shift1, shift2], [shift3, shift4], [shift5, shift6]]
  const getRowsByShifts = useCallback((shifts: ScheduleShift[]) => {
    const copyShifts = [...shifts];

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
        if (a.userName && b.userName) {
          return a.userName.localeCompare(b.userName);
        } else if (a.userName && !b.userName) {
          return 1;
        } else if (!a.userName && b.userName) {
          return -1;
        } else if (!a.userName && !b.userName) {
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

  const [isLoading, setIsLoading] = useState(true);

  const isEnter = useRef(false);

  const [radioValue, setRadioValue] = useState<Chooses>("Hours");

  const [roleViewData, setRoleViewData] = useImmer<ScheduleRole[]>([]);

  const loadGetScheduleShiftListRole = () => {
    isEnter.current = true;

    setIsLoading(true);

    scheduleShiftList<"Daily">({
      onlyOverTime,
      onlyUnPublished,
      communityId,
      departmentId: department.departmentId,
      type: "Daily",
      shiftStartDate: dayDate,
      shiftEndDate: null,
      chooses: radioValue,
      scheduleId: department?.scheduleId ?? null,
      ...searchParamsValue,
    })
      .then(({ code, data }) => {
        if (code !== 200) return;
        data.forEach((role) => {
          role.statistics?.forEach((statistic) => {
            statistic.shifts?.forEach((shift) => {
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
        });
        setRoleViewData(data || []);
      })
      .catch(() => {
        isEnter.current = false;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleEnter = () => {
    if (isEnter.current) return;

    if (!department?.scheduleId) {
      setIsLoading(false);
      isEnter.current = true;
      return;
    }
    loadGetScheduleShiftListRole();
    loadGetDepartmentCensusList();
  };

  useEffect(() => {
    // If the component is not entered, it will not be loaded.
    if (!isEnter.current) return;
    if (!department?.scheduleId) return;
    loadGetScheduleShiftListRole();
    loadGetDepartmentCensusList();
  }, [
    radioValue,
    dayDate,
    searchParamsValue,
    department,
    onlyOverTime,
    onlyUnPublished,
  ]);

  const updateScheduleShift = (
    shift: ScheduleShift,
    isConfirm: boolean = false
  ) => {
    setIsLoading(true);

    if (isConfirm) {
      setPublishErrorConfirm({
        loading: true,
      });
    }

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
          loadGetScheduleShiftListRole();
          return;
        }
        if (data.isSuccess) {
          isSuccess = true;
          toast.success(MESSAGE.edit, {
            position: "top-center",
          });
          loadGetScheduleShiftListRole();
          if (isConfirm) {
            setPublishErrorConfirm({
              data: null,
              visible: false,
              loading: false,
              validateMsg: [],
            });
          }
        } else {
          isSuccess = true;
          setPublishErrorConfirm({
            data: shift,
            visible: true,
            validateMsg: data.validateMsg,
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
        if (!isSuccess) {
          loadGetScheduleShiftListRole();
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

    const { workerRoleId, id } = shift;

    setRoleViewData((draft) => {
      const statistic = draft.find((role) => role.roleId === workerRoleId)
        ?.statistics?.[0];

      if (!statistic) return;

      const shift = statistic?.shifts.find((v) => v.id === id);

      if (!shift) return;

      shift.shiftDate = newStartDay;
      shift.shiftStartTime = newStartTimeDate;
      shift.shiftEndTime = newEndTimeDate;
    });

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

    const { workerRoleId, id } = shift;

    setRoleViewData((draft) => {
      const statistic = draft.find((role) => role.roleId === workerRoleId)
        ?.statistics?.[0];

      if (!statistic) return;

      const shift = statistic?.shifts.find((v) => v.id === id);

      if (!shift) return;

      shift.shiftStartTime = newStartTimeDate;
      shift.shiftEndTime = newEndTimeDate;
    });

    updateScheduleShift({
      ...shift,
      shiftStartTime: newStartTimeDate,
      shiftEndTime: newEndTimeDate,
    });
  };

  const [censusData, setCensusData] = useState<DepartmentCensusListRes[]>([]);

  const loadGetDepartmentCensusList = () => {
    departmentCensusList({
      communityId,
      departmentId: department.departmentId,
      startShiftDate: dayDate,
      endShiftDate: null,
    }).then(({ code, data }) => {
      if (code !== 200) return;
      setCensusData(data || []);
    });
  };

  const loadDepartmentCensusEdit = (value: number) => {
    const id = censusData?.[0]?.id;

    departmentCensusEdit({
      communityId,
      departmentId: department.departmentId,
      census: value,
      id,
    })
      .then(({ code }) => {
        if (code !== 200) return;

        toast.success(MESSAGE.edit, {
          position: "top-center",
        });

        loadGetDepartmentCensusList();
      })
      .finally(() => {
        loadGetScheduleShiftListRole();
      });
  };

  useImperativeHandle(ref, () => ({
    refresh: () => {
      loadGetScheduleShiftListRole();
      loadGetDepartmentCensusList();
    },
  }));

  const loadShiftTargetHppdAdjust = (data: ShiftTargetHppdAdjustParams) => {
    setIsLoading(true);

    shiftTargetHppdAdjust(data)
      .then(({ code }) => {
        if (code !== 200) return;

        toast.success(MESSAGE.edit, {
          position: "top-center",
        });
      })
      .finally(() => {
        setIsLoading(false);

        loadGetScheduleShiftListRole();
      });
  };

  const [publishErrorConfirm, setPublishErrorConfirm] = useSetState({
    data: null as ScheduleShift | null,
    visible: false,
    loading: false,
    validateMsg: [] as string[],
  });

  return (
    <div ref={wrapperRef}>
      {!!wrapperWidth && (
        <ViewportContainer onEnter={handleEnter}>
          <Spin loading={isLoading}>
            <>
              <ViewRadio
                id={department.departmentId}
                value={radioValue}
                isShowHPPD={department.isHppd}
                onChange={(value) => setRadioValue(value as Chooses)}
              />

              {censusData?.[0]?.id && (
                <div className="flex items-center mb-[15px]">
                  <span className="mr-[30px]">Census</span>
                  <ViewCensus
                    inputWidth="120px"
                    isShowLabel={false}
                    disabled={!canEdit}
                    value={censusData[0]?.census ? censusData[0]?.census : ""}
                    onBlur={(value) => {
                      if (value !== censusData[0]?.census) {
                        loadDepartmentCensusEdit(value);
                      }
                    }}
                  />
                </div>
              )}

              {!!roleViewData?.length && (
                <ViewRoleTags
                  roleList={roleViewData.map((role) => ({
                    name: role.roleName,
                    color: role.roleColor,
                  }))}
                />
              )}

              <div className="relative border-[1px] border-[#E7EDF1]">
                {getIsShowCurrentTimeline && (
                  <CurrentTimeline
                    contentWidth={contentWidth}
                    hourWidth={hourWidth}
                  />
                )}

                <Header dayHours={dayHours} contentWidth={contentWidth} />

                <div>
                  <>
                    {department?.scheduleId ? (
                      <>
                        {roleViewData?.map((role) => {
                          const statistic = role.statistics?.[0];

                          const shiftDate = statistic?.shiftDate;
                          const shifts = statistic?.shifts || [];
                          const targetHPPD = statistic?.targetHPPD?.toFixed(2);

                          const plannedHPPD =
                            statistic?.plannedHPPD?.toFixed(2);

                          const assignedHPPD =
                            statistic?.assignedHPPD?.toFixed(2);

                          const isExceedPlanned = !!(
                            statistic?.targetHPPD &&
                            statistic?.plannedHPPD &&
                            statistic?.targetHPPD > statistic?.plannedHPPD
                          );

                          const isExceedAssigned = !!(
                            statistic?.targetHPPD &&
                            statistic?.assignedHPPD &&
                            statistic?.targetHPPD > statistic?.assignedHPPD
                          );
                          const actualHPPD = statistic?.actualHPPD?.toFixed(2);

                          const hoursString = statistic?.hours?.toFixed(2);

                          const actualHours =
                            statistic?.actualHours?.toFixed(2);

                          const assignedHours =
                            statistic?.assignedHours?.toFixed(2);

                          const isBeforeToday = localMoment(
                            dayDate,
                            "MM/DD/YYYY"
                          ).isSameOrBefore(localMoment(), "day");

                          const color = isBlackRange(
                            hexToRgba(role.roleColor || "", 1)
                          )
                            ? "#FFF"
                            : "000";

                          return (
                            <CollapsiblePanel
                              key={role.roleId}
                              title={role.roleName}
                              roleColor={role.roleColor}
                              defaultOpen
                              isShowAddButton={canAdd && !isDisabled}
                              onAddShiftClick={() => {
                                handleAddShiftClick({
                                  departmentId: department.departmentId,
                                  workerRoleId: role.roleId,
                                });
                              }}
                              rightRender={
                                <div className="pr-[15px] z-50">
                                  {radioValue === "Hours" ? (
                                    <div className="flex items-center gap-4">
                                      <div>
                                        <span className="mr-[10px]">
                                          Planned Hours:
                                        </span>
                                        <span>{hoursString ?? "-"}</span>
                                      </div>
                                      <div>
                                        <span className="mr-[10px]">
                                          Assigned Hours:
                                        </span>
                                        <span>{assignedHours ?? "-"}</span>
                                      </div>
                                      {isBeforeToday && attendanceEnabled && (
                                        <div>
                                          <span className="mr-[10px]">
                                            Actual Hours:
                                          </span>
                                          <span>{actualHours ?? "-"}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-4">
                                      <TargetHPPD
                                        defaultValue={targetHPPD}
                                        roleColor={role.roleColor}
                                        onBlur={(value) => {
                                          loadShiftTargetHppdAdjust({
                                            communityId,
                                            departmentId:
                                              department.departmentId,
                                            workerRoleId: role.roleId,
                                            hppd: value,
                                            shiftDate: shiftDate,
                                            scheduleId:
                                              department.scheduleId as string,
                                          });
                                        }}
                                      />

                                      <div>
                                        <span className="mr-[10px]">
                                          Planned HPPD:
                                        </span>
                                        <span
                                          className={cn(
                                            isExceedPlanned
                                              ? "text-[#D35445]"
                                              : isBlackRange(
                                                  hexToRgba(
                                                    role.roleColor || "",
                                                    1
                                                  )
                                                )
                                              ? "#FFF"
                                              : "text-[#949fb2]"
                                          )}
                                        >
                                          {plannedHPPD ?? "-"}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="mr-[10px]">
                                          Assigned HPPD:
                                        </span>
                                        <span
                                          className={cn(
                                            isExceedAssigned
                                              ? "text-[#D35445]"
                                              : isBlackRange(
                                                  hexToRgba(
                                                    role.roleColor || "",
                                                    1
                                                  )
                                                )
                                              ? "#FFF"
                                              : "text-[#949fb2]"
                                          )}
                                          style={{
                                            color,
                                          }}
                                        >
                                          {assignedHPPD ?? "-"}
                                        </span>
                                      </div>
                                      {isBeforeToday && attendanceEnabled && (
                                        <div>
                                          <span className="mr-[10px]">
                                            Actual HPPD:
                                          </span>
                                          <span>{actualHPPD ?? "-"}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              }
                            >
                              {getRowsByShifts(shifts).map((row, i) => {
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
                              })}
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
                  </>
                </div>
              </div>
            </>
          </Spin>
        </ViewportContainer>
      )}
      <PublishShiftErrorDia
        publishErrorConfirm={publishErrorConfirm}
        setPublishErrorConfirm={setPublishErrorConfirm}
        refresh={() => {
          loadGetScheduleShiftListRole();
        }}
        callBack={() => {
          updateScheduleShift(publishErrorConfirm.data as ScheduleShift, true);
        }}
      ></PublishShiftErrorDia>
    </div>
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

  const { localMoment, UTCMoment, zoneAbbr } = useGlobalTime();

  const { attendanceEnabled } = useGlobalCommunityId();

  const {
    userName,
    id,
    isPublished,
    attendeeStatus,
    startTimeUTC,
    checkinTime,
    checkoutTime,
  } = shift;

  const isShiftStart = localMoment().isSameOrAfter(
    UTCMoment(startTimeUTC),
    "minute"
  );

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
  const isClickView =
    !canEdit || isShiftStart || checkinTime || checkoutTime || isDisabled;

  const redBg =
    attendanceEnabled &&
    (isRedBg(shift, isShowAttendeeStatus) || isShowAttendeeStatus);

  return (
    <ShiftContainer<ScheduleShift>
      title={title}
      redBg={redBg}
      isPurple={tags.includes(4)}
      key={shift.id}
      shift={shift}
      hourWidth={hourWidth}
      startTime={UTCMoment(shift.startTimeUTC).format("MM/DD/YYYY HH:mm")}
      endTime={UTCMoment(shift.endTimeUTC).format("MM/DD/YYYY HH:mm")}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onClick={() => {
        onShiftItemClick(shift, isClickView);
      }}
      isOpen={!userName}
      enabled={!isClickView}
      isWarning={tags.includes(3)}
      isNotPublished={isNotPublished}
      dayDate={dayDate}
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
                  "absolute left-[10px] top-[6px] items-center justify-center flex"
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
                  <span>{userName ? userName : "OPEN"}</span>
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
                    if (canEdit && !isDisabled && !isDragging) {
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
