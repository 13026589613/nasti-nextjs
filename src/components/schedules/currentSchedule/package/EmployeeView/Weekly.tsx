import { DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { useSetState } from "ahooks";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useImmer } from "use-immer";
import { useShallow } from "zustand/react/shallow";

import {
  departmentScheduleRoles,
  publishErrorConfirmOk,
  publishSchedule,
  republishSchedule,
  scheduleShiftEdit,
  scheduleShiftListEmployee,
  unpublishSchedule,
} from "@/api/currentSchedule";
import {
  ActiveScheduleShift,
  DepartmentShiftVO,
  ScheduleShift,
  ScheduleUser,
} from "@/api/currentSchedule/types";
import PublishShiftErrorDia from "@/app/(system)/(service)/currentSchedule/components/PublishShiftErrorDia";
import SelectTemplateDia from "@/app/(system)/(service)/currentSchedule/components/selectTemplate";
import AuthProvide from "@/components/custom/Auth";
import Button from "@/components/custom/Button";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import Spin from "@/components/custom/Spin";
import ViewportContainer from "@/components/schedules/components/ViewportContainer";
import ViewRoleTags from "@/components/schedules/components/ViewRoleTags";
import CollapsiblePanel from "@/components/schedules/components/weekly/CollapsiblePanel";
import ColumnContainer from "@/components/schedules/components/weekly/ColumnContainer";
import DndContainer from "@/components/schedules/components/weekly/DndContainer";
import Header from "@/components/schedules/components/weekly/Header";
import { WeeklyDaysType } from "@/components/schedules/types/weekly";
import { MESSAGE } from "@/constant/message";
import useGlobalTime from "@/hooks/useGlobalTime";
import useAppStore from "@/store/useAppStore";
import { sortScheduleShiftList } from "@/utils/sortByKey";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";

import ViewNoData from "../../ViewNoData";
import EmptyShift from "../components/emptyShift";
// import ViewRadio from "../../ViewRadio";
import ShiftItem from "../components/ShiftItem";

interface EmployeeViewWeeklyProps {
  onlyOverTime?: boolean;
  onlyUnPublished?: boolean;
  canEdit?: boolean;
  canAdd?: boolean;
  department: DepartmentShiftVO;
  communityId: string;
  startDay: string;
  endDay: string;
  weeklyDays: WeeklyDaysType[];
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
    departmentId: string;
    userId: string;
    weeklyDay: WeeklyDaysType;
  }) => void;
  refreshDepartment?: () => void;
  setHasUnpublished?: (departmentId: string, has: boolean) => void;
  statusClick?: (tag: number, shift: ScheduleShift) => void;
}

const EmployeeViewWeekly = forwardRef<any, EmployeeViewWeeklyProps>(
  (props, ref) => {
    const {
      canAdd = true,
      canEdit = true,
      startDay,
      endDay,
      department,
      weeklyDays,
      communityId,
      searchParamsValue,
      selectShiftIds,
      onlyOverTime,
      onlyUnPublished,
      onShiftItemClick,
      handleAddShiftClick,
      refreshDepartment,
      setHasUnpublished,
      statusClick,
      onShiftSelect,
    } = props;

    const { navbarWidth } = useAppStore(
      useShallow((state) => ({
        ...state,
      }))
    );

    const { localMoment, UTCMoment } = useGlobalTime();

    // If there is no scheduler yet, you need the Add Schedule permission.
    // If there is already a schedule, you need the Edit Schedule permission.
    const canApplyTemplate = useMemo(() => {
      if (department?.scheduleId && canEdit) {
        return true;
      }

      if (!department?.scheduleId && canAdd) {
        return true;
      }

      return false;
    }, [department, canEdit, canAdd]);

    const isCurrentWeek = useMemo(() => {
      return (
        localMoment().isSameOrBefore(
          localMoment(endDay, "MM/DD/YYYY"),
          "day"
        ) &&
        localMoment().isSameOrAfter(localMoment(startDay, "MM/DD/YYYY"), "day")
      );
    }, [endDay, startDay]);

    const isBeforeWeek = useMemo(() => {
      return localMoment(endDay, "MM/DD/YYYY").isBefore(localMoment(), "day");
    }, [endDay]);

    const [isLoading, setIsLoading] = useState(true);

    const isEnter = useRef(false);

    const [employeeViewData, setEmployeeViewData] = useImmer<ScheduleUser[]>(
      []
    );

    const handleEnter = () => {
      if (isEnter.current) return;

      if (!department?.scheduleId) {
        setIsLoading(false);
        isEnter.current = true;
        return;
      }

      loadGetScheduleShiftList();
    };

    const [hasShift, setHasShift] = useState(false);

    //The shift that needs to be verified is considered as the published shift
    const [hasUnpublishedShift, setHasUnpublishedShift] = useState(false);

    const loadGetScheduleShiftList = () => {
      isEnter.current = true;

      setIsLoading(true);

      scheduleShiftListEmployee<"Weekly">({
        onlyOverTime,
        onlyUnPublished,
        communityId,
        departmentId: department.departmentId,
        type: "Weekly",
        shiftStartDate: startDay,
        shiftEndDate: endDay,
        scheduleId: department?.scheduleId ?? null,
        ...searchParamsValue,
      })
        .then(({ code, data }) => {
          if (code !== 200) return;
          setHasShift(false);
          let hasUnPublishShift = false;
          let hasShift = false;
          data.forEach((item) => {
            const { statistics } = item;
            if (statistics) {
              statistics.map((item) => {
                if (item.shifts && item.shifts.length > 0) {
                  hasShift = true;
                  item.shifts.forEach((shift) => {
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

                      const isBeforeToday = localMoment(
                        shift.shiftDate,
                        "MM/DD/YYYY"
                      ).isBefore(localMoment(), "day");

                      const isWeekInner = UTCMoment(
                        shift.startTimeUTC
                      ).isSameOrAfter(startDay, "day");

                      if (
                        !shift.isPublished &&
                        department.isPublished &&
                        !shift?.tags?.includes(4) &&
                        !isBeforeToday &&
                        shift.id &&
                        isWeekInner
                      ) {
                        hasUnPublishShift = true;
                      }

                      if (isWeekInner) {
                        hasShift = true;
                      }
                    }
                  });
                }
              });
            } else {
              item.statistics = [
                {
                  shiftDate: "",
                  shifts: [],
                },
              ];
            }
            item.statistics = sortScheduleShiftList(
              item.statistics,
              "employee"
            );
          });
          setHasShift(hasShift);

          setHasUnpublishedShift(hasUnPublishShift);
          setHasUnpublished &&
            setHasUnpublished(department.departmentId, hasUnPublishShift);

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
      setHasShift(false);
      if (!isEnter.current) return;
      if (!department?.scheduleId) return;
      loadGetScheduleShiftList();
    }, [
      startDay,
      endDay,
      searchParamsValue,
      department,
      onlyOverTime,
      onlyUnPublished,
    ]);

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

    useImperativeHandle(ref, () => ({
      refresh: () => {
        loadGetScheduleShiftList();
      },
    }));

    const [activeShiftInfo, setActiveShiftInfo] =
      useState<ActiveScheduleShift | null>(null);

    const handleDragEnd = (event: DragEndEvent) => {
      setActiveShiftInfo(null);
      const { active, over } = event;

      const activeType = active.data.current?.type;
      const overType = over?.data.current?.type;

      const activeShift = active.data.current?.shift as ScheduleShift;

      if (!activeShift) return;

      const isAShiftAsFooter = UTCMoment(activeShift.startTimeUTC).isBefore(
        UTCMoment(activeShift.timeStartTime)
      );

      let activeShiftDate = activeShift.shiftDate;

      if (isAShiftAsFooter) {
        activeShiftDate = UTCMoment(activeShift.timeStartTime).format(
          "MM/DD/YYYY"
        );
      }

      if (overType === "item" && over?.data.current) {
        const shift = over.data.current?.shift as ScheduleShift;

        let date = shift?.shiftDate;

        if (shift.timeId) {
          date = UTCMoment(shift.timeStartTime).format("MM/DD/YYYY");
        }

        if (localMoment(date, "MM/DD/YYYY").isBefore(localMoment(), "day")) {
          return;
        }

        if (isAShiftAsFooter) {
          if (
            localMoment(date, "MM/DD/YYYY").isBefore(
              localMoment().add(1, "day"),
              "day"
            )
          ) {
            return;
          }
        }
      }

      if (overType === "container" && over?.data.current) {
        let date = over?.id;
        if (localMoment(date, "MM/DD/YYYY").isBefore(localMoment(), "day")) {
          return;
        }

        if (isAShiftAsFooter) {
          if (
            localMoment(date, "MM/DD/YYYY").isBefore(
              localMoment().add(1, "day"),
              "day"
            )
          ) {
            return;
          }
        }
      }

      if (overType === "emptyShift" && over?.data.current) {
        let date = over?.data.current?.date;
        if (localMoment(date, "MM/DD/YYYY").isBefore(localMoment(), "day")) {
          return;
        }

        if (isAShiftAsFooter) {
          if (
            localMoment(date, "MM/DD/YYYY").isBefore(
              localMoment().add(1, "day"),
              "day"
            )
          ) {
            return;
          }
        }
      }

      // Again it's all shift logic
      if (
        activeType === "item" &&
        overType === "item" &&
        active &&
        over &&
        active.id !== over.id
      ) {
        const overShift = over.data.current?.shift as ScheduleShift;

        if (!overShift) return;

        let overShiftDate = overShift.shiftDate;

        const isOverShiftAsFooter = UTCMoment(overShift.startTimeUTC).isBefore(
          overShift.timeStartTime
        );

        if (isOverShiftAsFooter) {
          overShiftDate = UTCMoment(overShift.timeStartTime).format(
            "MM/DD/YYYY"
          );
        }

        if (overShiftDate === activeShiftDate) {
          return;
        }

        setEmployeeViewData((draft) => {
          const aUser = draft.find((user) => {
            if (
              user.userId === "00000000-0000-0000-0000-000000000000" &&
              !activeShift.userId
            ) {
              return true;
            }
            return user.userId === activeShift.userId;
          });

          const statistic = aUser?.statistics?.find((item) => {
            return activeShift.shiftDate === item.shiftDate;
          });

          const aShift = statistic?.shifts?.find(
            (shift) => shift.id === activeShift.id
          );

          const aShiftIndex = statistic?.shifts?.findIndex(
            (shift) => shift.id === activeShift.id
          );

          if (!aShift) return;

          if (aShiftIndex !== undefined) {
            statistic?.shifts.splice(aShiftIndex, 1);
          }
        });

        if (isAShiftAsFooter) {
          updateScheduleShift({
            ...activeShift,
            shiftDate: localMoment(overShiftDate, "MM/DD/YYYY")
              .subtract(1, "day")
              .format("MM/DD/YYYY"),
          });
        } else {
          updateScheduleShift({
            ...activeShift,
            shiftDate: overShiftDate,
          });
        }
      }

      if (
        activeType === "item" &&
        overType === "container" &&
        active &&
        over &&
        active.id !== over.id
      ) {
        const activeShift = active.data.current?.shift as ScheduleShift;

        const { id } = over as { id: string };

        if (!activeShift) return;

        if (activeShiftDate === id) {
          return;
        }

        setEmployeeViewData((draft) => {
          const aUser = draft.find((user) => {
            if (
              user.userId === "00000000-0000-0000-0000-000000000000" &&
              !activeShift.userId
            ) {
              return true;
            }
            return user.userId === activeShift.userId;
          });

          const statistic = aUser?.statistics?.find((item) => {
            return activeShift.shiftDate === item.shiftDate;
          });

          const aShift = statistic?.shifts?.find(
            (shift) => shift.id === activeShift.id
          );

          const aShiftIndex = statistic?.shifts?.findIndex(
            (shift) => shift.id === activeShift.id
          );

          if (!aShift) return;

          if (aShiftIndex !== undefined) {
            statistic?.shifts.splice(aShiftIndex, 1);
          }

          const oStatistic = aUser?.statistics?.find((item) => {
            return item.shiftDate === id;
          });

          if (!oStatistic) {
            aUser?.statistics.push({
              shiftDate: id,
              shifts: [
                {
                  ...aShift,
                  dragData: true,
                },
              ],
            });

            return;
          }

          if (aShift.shiftDate !== id) {
            aShift.shiftDate = id;

            if (oStatistic.shifts) {
              oStatistic.shifts.push({
                ...aShift,
                dragData: true,
              });
            } else {
              oStatistic.shifts = [
                {
                  ...aShift,
                  dragData: true,
                },
              ];
            }
          }
        });

        if (isAShiftAsFooter) {
          updateScheduleShift({
            ...activeShift,
            shiftDate: localMoment(id, "MM/DD/YYYY")
              .subtract(1, "day")
              .format("MM/DD/YYYY"),
          });
        } else {
          updateScheduleShift({
            ...activeShift,
            shiftDate: id,
          });
        }
      }

      if (
        activeType === "item" &&
        overType === "emptyShift" &&
        active &&
        over
      ) {
        const overData = over?.data?.current;

        if (!overData) {
          return;
        }

        const { date, index } = overData as {
          date: string;
          index: number;
        };

        if (date === activeShiftDate) {
          return;
        }

        setEmployeeViewData((draft) => {
          const aUser = draft.find((user) => {
            if (
              user.userId === "00000000-0000-0000-0000-000000000000" &&
              !activeShift.userId
            ) {
              return true;
            }
            return user.userId === activeShift.userId;
          });

          const aStatistic = aUser?.statistics?.find((item) => {
            return activeShift.shiftDate === item.shiftDate;
          });

          const aShift = aStatistic?.shifts?.find(
            (shift) => shift.id === activeShift.id
          );

          const aShiftIndex = aStatistic?.shifts?.findIndex(
            (shift) => shift.id === activeShift.id
          );

          if (!aShift) return;

          if (aShiftIndex !== undefined) {
            aStatistic?.shifts.splice(aShiftIndex, 1);
          }

          const oStatistic = aUser?.statistics?.find((item) => {
            return date === item.shiftDate;
          });

          if (!oStatistic) {
            aUser?.statistics.push({
              shiftDate: date,
              shifts: [
                {
                  ...aShift,
                  dragData: true,
                },
              ],
            });

            return;
          }

          if (aShift.shiftDate !== date) {
            aShift.shiftDate = date;
            if (oStatistic.shifts) {
              oStatistic.shifts[index] = {
                ...aShift,
                dragData: true,
              };
            } else {
              oStatistic.shifts = [
                {
                  ...aShift,
                  dragData: true,
                },
              ];
            }
          }
        });

        if (isAShiftAsFooter) {
          updateScheduleShift({
            ...activeShift,
            shiftDate: localMoment(date, "MM/DD/YYYY")
              .subtract(1, "day")
              .format("MM/DD/YYYY"),
          });
        } else {
          updateScheduleShift({
            ...activeShift,
            shiftDate: date,
          });
        }
      }
    };

    const updateScheduleShift = (
      shift: ScheduleShift,
      isConfirm: boolean = false
    ) => {
      if (isConfirm) {
        setPublishErrorConfirmOne({
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
            loadGetScheduleShiftList();
            return;
          }
          if (data.isSuccess) {
            isSuccess = true;
            toast.success(MESSAGE.edit, {
              position: "top-center",
            });
            if (isConfirm) {
              setPublishErrorConfirmOne({
                visible: false,
              });
            }
            loadGetScheduleShiftList();
          } else {
            isSuccess = true;
            setPublishErrorConfirmOne({
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
            setPublishErrorConfirmOne({
              loading: false,
            });
          }
        });
    };

    const [openConfirm, setOpenConfirm] = useSetState({
      visible: false,
      loading: false,
    });

    const [publishConfirm, setPublishConfirm] = useSetState({
      visible: false,
      loading: false,
      isRepublish: false,
    });

    const publishScheduleFn = async (isRepublish: boolean) => {
      setPublishConfirm({
        loading: true,
      });
      try {
        let api = publishSchedule;
        if (isRepublish) {
          api = republishSchedule;
        }
        const res = await api(department.scheduleId as string);
        if (res.code === 200) {
          const data = res.data;
          if (data.isSuccess) {
            toast.success(MESSAGE.publish, {
              position: "top-center",
            });
            setPublishConfirm({
              visible: false,
              loading: false,
            });
            refreshDepartment && refreshDepartment();
          } else {
            setPublishErrorConfirm({
              visible: true,
              loading: false,
              validateMsg: data.validateMsg,
              validateKey: data.validateKey,
            });
          }
        }
      } finally {
        setPublishConfirm({
          loading: false,
        });
      }
    };

    const [publishErrorConfirm, setPublishErrorConfirm] = useSetState({
      visible: false,
      loading: false,
      validateMsg: [] as string[],
      validateKey: "",
    });

    const publishErrorConfirmOkFn = async () => {
      setPublishErrorConfirm({
        loading: true,
      });
      try {
        const res = await publishErrorConfirmOk(
          publishErrorConfirm.validateKey
        );
        if (res.code === 200) {
          toast.success(MESSAGE.publish, {
            position: "top-center",
          });
          setPublishErrorConfirm({
            visible: false,
            loading: false,
            validateMsg: [],
            validateKey: "",
          });
          setPublishConfirm({
            visible: false,
            loading: false,
          });
          refreshDepartment && refreshDepartment();
        }
      } finally {
        setPublishErrorConfirm({
          loading: false,
        });
      }
    };

    const [unpublishConfirm, setUnpublishConfirm] = useSetState({
      visible: false,
      loading: false,
    });

    const unpublishScheduleFn = async () => {
      setPublishConfirm({
        loading: true,
      });
      try {
        const res = await unpublishSchedule(department.scheduleId as string);
        if (res.code === 200) {
          toast.success(MESSAGE.unpublish, {
            position: "top-center",
          });
          setUnpublishConfirm({
            visible: false,
            loading: false,
          });
          refreshDepartment && refreshDepartment();
        }
      } finally {
        setUnpublishConfirm({
          loading: false,
        });
      }
    };

    const [publishErrorConfirmOne, setPublishErrorConfirmOne] = useSetState({
      visible: false,
      loading: false,
      validateMsg: [] as string[],
      data: null as ScheduleShift | null,
    });

    return (
      <ViewportContainer onEnter={handleEnter}>
        <Spin loading={isLoading}>
          <div className="flex justify-end mt-4">
            {department?.isTemplateExist &&
              !department?.isPublished &&
              !isBeforeWeek &&
              canApplyTemplate && (
                <Button
                  onClick={() => {
                    setOpenConfirm({ visible: true });
                  }}
                  icon="templateIcon"
                  colorStyle="green97"
                >
                  Apply Template
                </Button>
              )}

            {department?.scheduleId && (
              <>
                {department?.isPublished && !isBeforeWeek && !isCurrentWeek && (
                  <AuthProvide permissionName={"SCHEDULE_MANAGEMENT_PUBLISH"}>
                    <Button
                      icon="unpublishIcon"
                      colorStyle="yellow"
                      className={"ml-[16px]"}
                      onClick={() => {
                        setUnpublishConfirm({
                          visible: true,
                          loading: false,
                        });
                      }}
                    >
                      Unpublish Schedule
                    </Button>
                  </AuthProvide>
                )}
                {department?.isPublished &&
                  hasUnpublishedShift &&
                  !isBeforeWeek && (
                    <AuthProvide permissionName={"SCHEDULE_MANAGEMENT_PUBLISH"}>
                      <Button
                        icon="inviteIcon"
                        colorStyle="blue"
                        className={"ml-[16px]"}
                        onClick={() => {
                          setPublishConfirm({
                            visible: true,
                            loading: false,
                            isRepublish: true,
                          });
                        }}
                      >
                        Republish Schedule
                      </Button>
                    </AuthProvide>
                  )}
                {!department?.isPublished && !isBeforeWeek && (
                  <AuthProvide permissionName={"SCHEDULE_MANAGEMENT_PUBLISH"}>
                    <Button
                      icon="inviteIcon"
                      colorStyle="blue"
                      className={"ml-[16px]"}
                      onClick={() => {
                        setPublishConfirm({
                          visible: true,
                          loading: false,
                          isRepublish: false,
                        });
                      }}
                    >
                      Publish Schedule
                    </Button>
                  </AuthProvide>
                )}
              </>
            )}
          </div>
          {department?.scheduleId && <ViewRoleTags roleList={roleList} />}

          <Header
            weeklyDays={weeklyDays}
            showDayOfWeek
            className="h-[80px]"
            currentDay={localMoment().format("MM/DD/YYYY")}
          />

          {department?.scheduleId ? (
            <>
              {employeeViewData.map((user) => {
                let shift: any = null;
                user.statistics?.forEach((item) => {
                  item.shifts?.forEach((shiftItem) => {
                    if (shiftItem.tags && shiftItem.tags?.includes(3)) {
                      shift = shiftItem;
                    }
                  });
                });
                return (
                  <CollapsiblePanel
                    key={user.userId}
                    weeklyDays={weeklyDays}
                    title={user.userName}
                    roleColor="#F4F4F5"
                    defaultOpen
                    showAddBtn={canAdd}
                    onAddShiftClick={(weeklyDay) => {
                      handleAddShiftClick({
                        departmentId: department.departmentId,
                        weeklyDay,
                        userId: user.userId,
                      });
                    }}
                    beforeTitle={
                      <>
                        {shift ? (
                          <div className="inline-block h-full mr-3">
                            <OvertimeIcon width="18px"></OvertimeIcon>
                          </div>
                        ) : null}
                      </>
                    }
                  >
                    <DndContainer
                      onDragStart={(event) => {
                        const { active } = event;

                        const activeCurrent = active.data.current
                          ?.shift as ScheduleShift;

                        if (!activeCurrent) return;

                        setActiveShiftInfo(activeCurrent);
                      }}
                      onDragEnd={(event) => {
                        handleDragEnd(event);
                      }}
                    >
                      <div className="flex pl-[100px] border-r-[1px] border-r-[#E7EDF1]">
                        {weeklyDays?.map(({ dayOfWeek, date }) => {
                          const statistic = user?.statistics?.find((item) => {
                            return item.shiftDate === date;
                          });

                          let shiftList = statistic?.shifts
                            ? [...statistic?.shifts]
                            : [];

                          return (
                            <div
                              className="border-l-[#E7EDF1] border-l-[1px]"
                              key={dayOfWeek}
                              style={{
                                width: (navbarWidth - 135) / 7,
                                minWidth: "calc((100% - 135px) / 7)",
                              }}
                            >
                              <ColumnContainer
                                id={`${date}`}
                                classname="overflow-visible"
                              >
                                <div className="m-[15px_0_15px]">
                                  {shiftList.map((shift, index) => (
                                    <ShiftItemBox
                                      key={shift.id + shift.timeId}
                                      shift={shift}
                                      canEdit={canEdit}
                                      selectShiftIds={selectShiftIds}
                                      date={date}
                                      onShiftSelect={onShiftSelect}
                                      onShiftItemClick={onShiftItemClick}
                                      statusClick={statusClick}
                                      index={index}
                                      id={user.userId}
                                    ></ShiftItemBox>
                                  ))}
                                </div>
                              </ColumnContainer>
                            </div>
                          );
                        })}
                      </div>
                      <DragOverlay adjustScale={false}>
                        {/* Drag Overlay For item Item */}
                        {activeShiftInfo && (
                          <ShiftItem
                            isWeek={true}
                            shift={activeShiftInfo}
                            selectShiftIds={selectShiftIds}
                            isCrossDayEnd={activeShiftInfo?.showRight}
                            isCrossDayStart={activeShiftInfo?.showLeft}
                          />
                        )}
                      </DragOverlay>
                    </DndContainer>
                  </CollapsiblePanel>
                );
              })}
            </>
          ) : !department?.isTemplateExist ? (
            <>
              <ViewNoData
                className="pt-[95px]"
                textList={[
                  "No schedule for this week yet.",
                  "This department does not appear to have a template set up.",
                  "Templates can reduce time to build schedules with pre-defined shifts and times.",
                  "Click the button below to build a template, or you can click the Add Shift button above to schedule shifts directly without using a template.",
                ]}
              />
            </>
          ) : (
            <>
              <ViewNoData
                className="pt-[150px]"
                textList={[
                  "No schedule for this week yet.",
                  `Build one by clicking the "Add Shift" or "Apply Template" button now.`,
                ]}
                showBtn={false}
              />
            </>
          )}
        </Spin>
        {openConfirm.visible && (
          <SelectTemplateDia
            open={openConfirm.visible}
            onSuccess={() => {
              refreshDepartment && refreshDepartment();
            }}
            setOpen={(open) => {
              setOpenConfirm({ visible: open });
            }}
            applyInfo={{
              communityId,
              departmentId: department.departmentId,
              shiftStartDate: startDay,
              shiftEndDate: endDay,
              scheduleId: department?.scheduleId ?? null,
            }}
            hasShift={hasShift}
          ></SelectTemplateDia>
        )}
        {publishConfirm.visible && (
          <ConfirmDialog
            open={publishConfirm.visible}
            btnLoading={publishConfirm.loading}
            width="521px"
            onClose={() => {
              setPublishConfirm({
                visible: false,
              });
            }}
            onOk={() => {
              publishScheduleFn(publishConfirm.isRepublish);
            }}
          >
            {`Are you sure you want to ${
              publishConfirm.isRepublish ? "republish" : "publish"
            } this schedule?`}
          </ConfirmDialog>
        )}
        {publishErrorConfirm.visible && (
          <ConfirmDialog
            open={publishErrorConfirm.visible}
            btnLoading={publishErrorConfirm.loading}
            width="521px"
            onClose={() => {
              setPublishErrorConfirm({
                visible: false,
                loading: false,
                validateMsg: [],
                validateKey: "",
              });
              setPublishConfirm({
                visible: false,
                loading: false,
              });
            }}
            onOk={() => {
              publishErrorConfirmOkFn();
            }}
          >
            <div>
              {publishErrorConfirm.validateMsg.map((msg, index) => (
                <div key={index}>{msg}</div>
              ))}
            </div>
          </ConfirmDialog>
        )}
        {unpublishConfirm.visible && (
          <ConfirmDialog
            open={unpublishConfirm.visible}
            btnLoading={unpublishConfirm.loading}
            width="521px"
            onClose={() => {
              setUnpublishConfirm({
                visible: false,
              });
              setPublishConfirm({
                visible: false,
              });
            }}
            onOk={() => {
              unpublishScheduleFn();
            }}
          >
            Are you sure you want to unpublish this schedule?
          </ConfirmDialog>
        )}
        <PublishShiftErrorDia
          publishErrorConfirm={publishErrorConfirmOne}
          setPublishErrorConfirm={setPublishErrorConfirmOne}
          refresh={() => {
            loadGetScheduleShiftList();
          }}
          callBack={() => {
            if (publishErrorConfirmOne.data) {
              updateScheduleShift(publishErrorConfirmOne.data, true);
            }
          }}
        ></PublishShiftErrorDia>
      </ViewportContainer>
    );
  }
);

EmployeeViewWeekly.displayName = "EmployeeViewWeekly";

export default EmployeeViewWeekly;

const ShiftItemBox = ({
  shift,
  canEdit,
  selectShiftIds,
  date,
  index,
  id,
  onShiftSelect,
  onShiftItemClick,
  statusClick,
}: {
  shift: ScheduleShift;
  canEdit: boolean;
  selectShiftIds: string[];
  date?: string;
  index: number;
  id: string;
  onShiftSelect: (shift: ScheduleShift) => void;
  onShiftItemClick: (shift: ScheduleShift, view: boolean) => void;
  statusClick?: (tag: number, shift: ScheduleShift) => void;
}) => {
  const { localMoment, UTCMoment } = useGlobalTime();

  const { navbarWidth } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  let shiftDate = shift.dayOfWeek;
  if (shiftDate === 7) {
    shiftDate = 0;
  }

  const isShiftStart = localMoment().isSameOrAfter(
    UTCMoment(shift.startTimeUTC),
    "minutes"
  );

  const { checkoutTime, checkinTime } = shift;

  let isClickView = !canEdit || isShiftStart || checkinTime || checkoutTime;
  const { startTimeUTC, endTimeUTC, dragData } = shift;

  const isCrossDayStart = useMemo(() => {
    return (
      UTCMoment(startTimeUTC).isBefore(
        localMoment(date, "MM/DD/YYYY"),
        "day"
      ) && !dragData
    );
  }, [startTimeUTC, date]);

  const isCrossDayEnd = useMemo(() => {
    if (UTCMoment(endTimeUTC).format("hh:mm A") === "12:00 AM") {
      return false;
    }
    return (
      UTCMoment(endTimeUTC).isAfter(localMoment(date, "MM/DD/YYYY"), "day") &&
      !dragData
    );
  }, [endTimeUTC, date]);

  const width = useMemo(() => {
    if (navbarWidth <= 1330) {
      return (1330 - 135) / 7;
    }
    return (navbarWidth - 135) / 7;
  }, [navbarWidth]);

  return (
    <div
      style={
        shift.isCrossDayStart
          ? {
              width: width * 2 - 24,
            }
          : {}
      }
    >
      {!shift?.isShowEmpty && (
        <ShiftItem
          isWeek={true}
          selectShiftIds={selectShiftIds}
          onSelectShiftId={onShiftSelect}
          onClick={() => {
            onShiftItemClick(shift, isClickView);
          }}
          notPublished={!shift.isPublished && !shift?.tags?.includes(4)}
          key={shift.id + shift.timeId}
          shift={shift}
          statusClick={(tag) => {
            if (canEdit && !isShiftStart) {
              statusClick && statusClick(tag, shift);
            }
          }}
          isCrossDayEnd={isCrossDayEnd}
          isCrossDayStart={isCrossDayStart}
        />
      )}
      {shift?.isShowEmpty && (
        <EmptyShift index={index} id={id} date={date as string}></EmptyShift>
      )}
    </div>
  );
};
