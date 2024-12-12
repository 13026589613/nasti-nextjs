import { DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { useSetState } from "ahooks";
import { useRouter } from "next/navigation";
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
  departmentCensusEdit,
  departmentCensusList,
  publishErrorConfirmOk,
  publishSchedule,
  republishSchedule,
  scheduleShiftEdit,
  scheduleShiftList,
  shiftTargetHppdAdjust,
  unpublishSchedule,
} from "@/api/currentSchedule";
import {
  ActiveScheduleShift,
  Chooses,
  DepartmentCensusListRes,
  DepartmentShiftVO,
  ScheduleRole,
  ScheduleShift,
  ShiftTargetHppdAdjustParams,
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
import ViewCensus from "@/components/schedules/currentSchedule/ViewCensus";
import { WeeklyDaysType } from "@/components/schedules/types/weekly";
import { getDateString } from "@/components/schedules/utils";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useDepartmentStore from "@/store/useDepartmentStore";
import { hexToRgba, isBlackRange } from "@/utils/hexToRgba";
import { sortScheduleShiftList } from "@/utils/sortByKey";

import TargetHPPD from "../../TargetHPPD";
import ViewContainer from "../../ViewContainer";
import ViewNoData from "../../ViewNoData";
import ViewRadio from "../../ViewRadio";
import EmptyShift from "../components/emptyShift";
import ShiftItem from "../components/ShiftItem";

interface RoleViewWeeklyProps {
  onlyOverTime?: boolean;
  onlyUnPublished?: boolean;
  canEdit?: boolean;
  canAdd?: boolean;
  department: DepartmentShiftVO;
  communityId: string;
  weeklyDays: WeeklyDaysType[];
  shiftStartDate: string;
  shiftEndDate: string;
  searchParamsValue: {
    locationIds: string[] | null;
    workerRoleIds: string[] | null;
    userIds: string[] | null;
    notAssigned: boolean;
  };
  selectShiftIds: string[];
  onShiftSelect: (shift: ScheduleShift) => void;
  setHasUnpublished?: (value: string, has: boolean) => void;
  onShiftItemClick: (shift: ScheduleShift, view: boolean) => void;
  handleAddShiftClick: (data: {
    departmentId: string;
    weeklyDay: WeeklyDaysType;
    roleId: string;
  }) => void;
  statusClick?: (tag: number, shift: ScheduleShift) => void;
  refreshDepartment?: (callBack?: Function) => void;
}

const RoleViewWeekly = forwardRef<any, RoleViewWeeklyProps>((props, ref) => {
  const {
    onlyOverTime,
    onlyUnPublished,
    canEdit = true,
    canAdd = true,
    department,
    communityId,
    weeklyDays,
    shiftStartDate,
    shiftEndDate,
    searchParamsValue,
    selectShiftIds,
    onShiftItemClick,
    handleAddShiftClick,
    refreshDepartment,
    setHasUnpublished,
    statusClick,
    onShiftSelect,
  } = props;

  const { attendanceEnabled } = useGlobalCommunityId();

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
        localMoment(shiftEndDate, "MM/DD/YYYY"),
        "day"
      ) &&
      localMoment().isSameOrAfter(
        localMoment(shiftStartDate, "MM/DD/YYYY"),
        "day"
      )
    );
  }, [shiftEndDate, shiftStartDate]);

  const isBeforeWeek = useMemo(() => {
    return localMoment(shiftEndDate, "MM/DD/YYYY").isBefore(
      localMoment(),
      "day"
    );
  }, [shiftEndDate]);

  const router = useRouter();

  const { setDepartment } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const [isLoading, setIsLoading] = useState(true);

  const isEnter = useRef(false);

  const [activeShiftInfo, setActiveShiftInfo] =
    useState<ActiveScheduleShift | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    const activeCurrent = active.data.current?.shift as ScheduleShift;

    if (!activeCurrent) return;

    setActiveShiftInfo(activeCurrent);
  };

  const [radioValue, setRadioValue] = useState<Chooses>("Hours");

  const [roleViewData, setRoleViewData] = useImmer<ScheduleRole[]>([]);

  const [hasShift, setHasShift] = useState(false);

  //The shift that needs to be verified is considered as the published shift
  const [hasUnpublishedShift, setHasUnpublishedShift] = useState(false);

  const loadGetScheduleShiftListRole = () => {
    isEnter.current = true;

    setIsLoading(true);

    scheduleShiftList<"Weekly">({
      onlyOverTime,
      onlyUnPublished,
      communityId,
      departmentId: department.departmentId,
      type: "Weekly",
      shiftStartDate,
      shiftEndDate,
      chooses: radioValue,
      scheduleId: department?.scheduleId ?? null,
      ...searchParamsValue,
    })
      .then(({ code, data }) => {
        if (code !== 200) return;

        let hasUnPublishShift = false;
        let hasShift = false;

        data.forEach((item) => {
          item.statistics?.forEach((item) => {
            if (item.shifts && item?.shifts?.length > 0) {
              item.shifts?.forEach((shift) => {
                if (shift && shift.id) {
                  shift.shiftDate = UTCMoment(shift.startTimeUTC, "").format(
                    "MM/DD/YYYY"
                  );
                  shift.shiftStartTime = UTCMoment(shift.startTimeUTC).format(
                    "hh:mm A"
                  );
                  shift.shiftEndTime = UTCMoment(shift.endTimeUTC).format(
                    "hh:mm A"
                  );

                  shift.timeEndTimeLocal = UTCMoment(shift.timeEndTime).format(
                    "hh:mm A"
                  );

                  shift.timeStartTimeLocal = UTCMoment(
                    shift.timeStartTime
                  ).format("hh:mm A");

                  const isWeekInner = UTCMoment(
                    shift.startTimeUTC
                  ).isSameOrAfter(shiftStartDate, "day");

                  const isBeforeToday = localMoment(
                    shift.shiftDate,
                    "MM/DD/YYYY"
                  ).isBefore(localMoment(), "day");

                  //The shift is not published, the department is published, and the shift is not a need to be verified shift
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
          item.statistics = sortScheduleShiftList(
            item.statistics || [],
            "role"
          );
        });

        setHasShift(hasShift);

        setHasUnpublishedShift(hasUnPublishShift);
        setHasUnpublished &&
          setHasUnpublished(department.departmentId, hasUnPublishShift);

        setRoleViewData(data || []);
      })
      .catch(() => {
        isEnter.current = false;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const [censusData, setCensusData] = useState<DepartmentCensusListRes[]>([]);

  const loadGetDepartmentCensusList = () => {
    departmentCensusList({
      communityId,
      departmentId: department.departmentId,
      startShiftDate: shiftStartDate,
      endShiftDate: shiftEndDate,
    }).then(({ code, data }) => {
      if (code !== 200) return;

      setCensusData(data || []);
    });
  };

  const handleEnter = () => {
    if (isEnter.current) return;
    if (!department?.scheduleId) {
      setIsLoading(false);
      isEnter.current = true;
      return;
    }

    loadGetDepartmentCensusList();
    loadGetScheduleShiftListRole();
  };

  useEffect(() => {
    setHasShift(false);
    if (!isEnter.current) return;
    if (!department?.scheduleId) return;
    loadGetDepartmentCensusList();
    loadGetScheduleShiftListRole();
  }, [department]);

  useEffect(() => {
    setHasShift(false);
    if (!isEnter.current) return;
    if (!department?.scheduleId) return;
    loadGetDepartmentCensusList();
    loadGetScheduleShiftListRole();
  }, [
    radioValue,
    shiftStartDate,
    shiftEndDate,
    searchParamsValue,
    onlyOverTime,
    onlyUnPublished,
  ]);

  const loadDepartmentCensusEdit = (id: string, value: number) => {
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
      })
      .finally(() => {
        loadGetDepartmentCensusList();

        loadGetScheduleShiftListRole();
      });
  };

  const updateScheduleShift = (
    shift: ScheduleShift,
    isConfirm: boolean = false
  ) => {
    setIsLoading(true);
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
          loadGetScheduleShiftListRole();
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
          loadGetScheduleShiftListRole();
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
        setIsLoading(false);
        if (!isSuccess) {
          loadGetScheduleShiftListRole();
        }
        if (isConfirm) {
          setPublishErrorConfirmOne({
            loading: false,
          });
        }
      });
  };

  const handleDragEnd = (event: DragEndEvent) => {
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
        overShiftDate = UTCMoment(overShift.timeStartTime).format("MM/DD/YYYY");
      }

      if (overShiftDate === activeShift.shiftDate) {
        return;
      }

      setRoleViewData((draft) => {
        const aRole = draft?.find(
          (role) => role.roleId === activeShift.workerRoleId
        );

        const aStatistic = aRole?.statistics?.find(
          (statistic) =>
            getDateString(statistic.shiftDate, "MM/DD/YYYY") ===
            activeShift.shiftDate
        );

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

        const oStatistic = draft
          ?.find((role) => role.roleId === overShift.workerRoleId)
          ?.statistics?.find(
            (statistic) =>
              getDateString(statistic.shiftDate, "MM/DD/YYYY") === overShiftDate
          );

        if (!oStatistic) return;

        aShift.shiftDate = overShiftDate;
        // oStatistic.shifts.push(aShift);
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

      const { departmentId, roleId, date } = over.data.current as {
        departmentId: string;
        roleId: string;
        date: string;
      };

      if (!activeShift || !departmentId) return;

      if (date === activeShiftDate) {
        return;
      }

      setRoleViewData((draft) => {
        const aRole = draft?.find(
          (role) => role.roleId === activeShift.workerRoleId
        );

        const aStatistic = aRole?.statistics?.find(
          (statistic) =>
            getDateString(statistic.shiftDate, "MM/DD/YYYY") ===
            activeShift.shiftDate
        );

        const aShift = aStatistic?.shifts?.find(
          (shift) => shift.id === activeShift.id
        );

        const aShiftIndex = aStatistic?.shifts?.findIndex(
          (shift) => shift.id === activeShift.id
        );

        if (!aShift) return;

        if (aShiftIndex !== undefined && aShift.shiftDate !== date) {
          aStatistic?.shifts.splice(aShiftIndex, 1);
        }

        const oRole = draft?.find((role) => role.roleId === roleId);

        const oStatistic = oRole?.statistics?.find((statistic) => {
          return getDateString(statistic.shiftDate, "MM/DD/YYYY") === date;
        });

        if (!oStatistic) {
          oRole?.statistics.push({
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

    if (activeType === "item" && overType === "emptyShift" && active && over) {
      const overData = over?.data?.current;

      if (!overData) {
        return;
      }

      const { date, index } = overData as {
        date: string;
        index: number;
      };

      if (activeShiftDate === date) {
        return;
      }

      setRoleViewData((draft) => {
        const aRole = draft?.find(
          (role) => role.roleId === activeShift.workerRoleId
        );

        const aStatistic = aRole?.statistics?.find(
          (statistic) =>
            getDateString(statistic.shiftDate, "MM/DD/YYYY") ===
            activeShift.shiftDate
        );

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

        const oRole = draft?.find(
          (role) => role.roleId === activeShift.workerRoleId
        );

        const oStatistic = oRole?.statistics?.find(
          (statistic) =>
            getDateString(statistic.shiftDate, "MM/DD/YYYY") === date
        );

        if (!oStatistic) {
          oRole?.statistics.push({
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

  useImperativeHandle(ref, () => ({
    refresh: () => {
      loadGetScheduleShiftListRole();
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
      const res = await publishErrorConfirmOk(publishErrorConfirm.validateKey);
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

  const { navbarWidth } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  return (
    <div>
      <ViewportContainer onEnter={handleEnter}>
        <Spin loading={isLoading}>
          <div className="flex items-center justify-between w-full h-10 mt-4 mb-4">
            <ViewRadio
              className="my-0"
              id={department.departmentId}
              value={radioValue}
              isShowHPPD={department.isHppd}
              onChange={(value) => setRadioValue(value as Chooses)}
            />
            <div className="flex">
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
                  {department?.isPublished &&
                    !isBeforeWeek &&
                    !isCurrentWeek && (
                      <AuthProvide
                        permissionName={"SCHEDULE_MANAGEMENT_PUBLISH"}
                      >
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
                      <AuthProvide
                        permissionName={"SCHEDULE_MANAGEMENT_PUBLISH"}
                      >
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
          </div>

          {!!roleViewData?.length && (
            <ViewRoleTags
              roleList={roleViewData.map((role) => ({
                name: role.roleName,
                color: role.roleColor,
              }))}
            />
          )}

          <Header
            weeklyDays={weeklyDays}
            showDayOfWeek
            className="h-[80px]"
            currentDay={localMoment().format("MM/DD/YYYY")}
          />

          {department.isCensus && !!censusData?.length && (
            <ViewContainer weeklyDays={weeklyDays}>
              {({ date }) => {
                const item = censusData.find((item) => item.shiftDate === date);
                return (
                  <>
                    {item?.id && (
                      <ViewCensus
                        isShowLabel={false}
                        disabled={!canEdit}
                        value={item?.census ? item?.census : ""}
                        onBlur={(value) => {
                          if (value !== item?.census) {
                            loadDepartmentCensusEdit(item?.id, value);
                          }
                        }}
                      />
                    )}
                  </>
                );
              }}
            </ViewContainer>
          )}

          <div>
            <>
              {
                <>
                  {department?.scheduleId ? (
                    <>
                      {roleViewData?.map((role) => {
                        return (
                          <CollapsiblePanel
                            key={role.roleId}
                            weeklyDays={weeklyDays}
                            title={role.roleName}
                            roleColor={role.roleColor}
                            defaultOpen
                            showAddBtn={canAdd}
                            onAddShiftClick={(weeklyDay) => {
                              handleAddShiftClick({
                                departmentId: department.departmentId,
                                weeklyDay,
                                roleId: role.roleId,
                              });
                            }}
                          >
                            <DndContainer
                              onDragStart={(event) => {
                                handleDragStart(event);
                              }}
                              onDragEnd={(event) => {
                                handleDragEnd(event);
                                setActiveShiftInfo(null);
                              }}
                            >
                              <div className="flex pl-[100px] border-r-[1px] border-r-[#E7EDF1]">
                                {weeklyDays?.map(({ date }) => (
                                  <div
                                    className="border-l-[#E7EDF1] border-l-[1px]"
                                    key={date}
                                    style={{
                                      width: (navbarWidth - 135) / 7,
                                      minWidth: "calc((1330px - 135px) / 7)",
                                    }}
                                  >
                                    <ColumnContainer
                                      id={date as string}
                                      other={{
                                        departmentId: department.departmentId,
                                        roleId: role.roleId,
                                        date,
                                      }}
                                      classname="overflow-visible"
                                    >
                                      {role?.statistics
                                        ?.filter((statistic) => {
                                          const shiftDate = getDateString(
                                            statistic.shiftDate,
                                            "MM/DD/YYYY"
                                          );

                                          return shiftDate === date;
                                        })
                                        .map((statistic) => {
                                          const actualHPPD =
                                            statistic?.actualHPPD?.toFixed(2);

                                          const targetHPPD =
                                            statistic?.targetHPPD?.toFixed(2);

                                          const plannedHPPD =
                                            statistic?.plannedHPPD?.toFixed(2);

                                          const assignedHPPD =
                                            statistic?.assignedHPPD?.toFixed(2);

                                          const hours =
                                            statistic?.hours?.toFixed(2);

                                          const actualHours =
                                            statistic?.actualHours?.toFixed(2);

                                          const assignedHours =
                                            statistic?.assignedHours?.toFixed(
                                              2
                                            );

                                          const isExceedPlanned = !!(
                                            targetHPPD &&
                                            plannedHPPD &&
                                            Number(targetHPPD) >
                                              Number(plannedHPPD)
                                          );

                                          const isExceedAssigned = !!(
                                            targetHPPD &&
                                            assignedHPPD &&
                                            Number(targetHPPD) >
                                              Number(assignedHPPD)
                                          );
                                          let shiftList = statistic?.shifts
                                            ? [...statistic?.shifts]
                                            : [];

                                          const isBeforeToday = localMoment(
                                            date,
                                            "MM/DD/YYYY"
                                          ).isSameOrBefore(
                                            localMoment(),
                                            "day"
                                          );

                                          return (
                                            <div
                                              key={statistic.shiftDate}
                                              className="h-full"
                                            >
                                              <div
                                                className={cn(
                                                  "border-b-[1px] border-b-[#E7EDF1]",
                                                  navbarWidth < 1400 &&
                                                    "h-[150px]"
                                                )}
                                              >
                                                {radioValue === "Hours" && (
                                                  <div className="p-[15px_0]">
                                                    <div>
                                                      <span className="mr-[10px]">
                                                        Planned Hours:
                                                      </span>
                                                      <span>
                                                        {hours ?? "-"}
                                                      </span>
                                                    </div>
                                                    <div>
                                                      <span className="mr-[10px]">
                                                        Assigned Hours:
                                                      </span>
                                                      <span>
                                                        {assignedHours ?? "-"}
                                                      </span>
                                                    </div>
                                                    {attendanceEnabled && (
                                                      <div className="h-6">
                                                        {isBeforeToday && (
                                                          <>
                                                            <span className="mr-[10px]">
                                                              Actual Hours:
                                                            </span>
                                                            <span>
                                                              {actualHours ??
                                                                "-"}
                                                            </span>
                                                          </>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                                {radioValue === "HPPD" && (
                                                  <div className="p-[15px_0]">
                                                    <TargetHPPD
                                                      roleColor={role.roleColor}
                                                      key={`${targetHPPD}-${statistic.shiftDate}`}
                                                      isWeekly
                                                      disabled={!canEdit}
                                                      defaultValue={targetHPPD}
                                                      onBlur={(value) => {
                                                        loadShiftTargetHppdAdjust(
                                                          {
                                                            communityId,
                                                            departmentId:
                                                              department.departmentId,
                                                            workerRoleId:
                                                              role.roleId,
                                                            hppd: value,
                                                            shiftDate:
                                                              statistic.shiftDate,
                                                            scheduleId:
                                                              department.scheduleId as string,
                                                          }
                                                        );
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
                                                                  role.roleColor ||
                                                                    "",
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
                                                                  role.roleColor ||
                                                                    "",
                                                                  1
                                                                )
                                                              )
                                                            ? "#FFF"
                                                            : "text-[#949fb2]"
                                                        )}
                                                      >
                                                        {assignedHPPD ?? "-"}
                                                      </span>
                                                    </div>
                                                    {attendanceEnabled && (
                                                      <div className="h-6">
                                                        {isBeforeToday && (
                                                          <>
                                                            <span className="mr-[10px]">
                                                              Actual HPPD:
                                                            </span>
                                                            <span
                                                              className={cn(
                                                                isExceedAssigned
                                                                  ? "text-[#D35445]"
                                                                  : isBlackRange(
                                                                      hexToRgba(
                                                                        role.roleColor ||
                                                                          "",
                                                                        1
                                                                      )
                                                                    )
                                                                  ? "#FFF"
                                                                  : "text-[#949fb2]"
                                                              )}
                                                            >
                                                              {actualHPPD ??
                                                                "-"}
                                                            </span>
                                                          </>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>

                                              <div className="m-[15px_0_15px]">
                                                {shiftList.map(
                                                  (shift, index) => (
                                                    <ShiftItemBox
                                                      key={shift.id + index}
                                                      index={index}
                                                      id={role.roleId}
                                                      date={date}
                                                      shift={shift}
                                                      canEdit={canEdit}
                                                      selectShiftIds={
                                                        selectShiftIds
                                                      }
                                                      onShiftSelect={
                                                        onShiftSelect
                                                      }
                                                      onShiftItemClick={
                                                        onShiftItemClick
                                                      }
                                                      statusClick={statusClick}
                                                    ></ShiftItemBox>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </ColumnContainer>
                                  </div>
                                ))}
                              </div>

                              <DragOverlay adjustScale={false}>
                                {/* Drag Overlay For item Item */}
                                {activeShiftInfo?.id && (
                                  <ShiftItem
                                    shift={activeShiftInfo}
                                    isWeek={true}
                                    isEmployeeView={false}
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
                        btnClick={() => {
                          setDepartment(
                            [department.departmentId],
                            "/scheduleTemplates"
                          );
                          router.push("/scheduleTemplates");
                        }}
                        className="pt-[95px]"
                        textList={[
                          "No schedule for this week yet.",
                          "This department does not appear to have a template set up.",
                          "Templates can reduce time to build schedules with pre-defined shifts and times.",
                          "Click the button below to build a template, or you can click the Add Shift button above to schedule shifts directly without using a template.",
                        ]}
                        showBtn
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
                </>
              }
            </>
          </div>
        </Spin>
      </ViewportContainer>
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
            shiftStartDate,
            shiftEndDate,
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
          width="560px"
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
          loadGetScheduleShiftListRole();
        }}
        callBack={() => {
          if (publishErrorConfirmOne.data) {
            updateScheduleShift(publishErrorConfirmOne.data, true);
          }
        }}
      ></PublishShiftErrorDia>
    </div>
  );
});

RoleViewWeekly.displayName = "RoleViewWeekly";

export default RoleViewWeekly;

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

  const isShiftStart = localMoment().isSameOrAfter(
    UTCMoment(shift.startTimeUTC),
    "minutes"
  );

  const { checkoutTime, checkinTime, startTimeUTC, endTimeUTC, dragData } =
    shift;

  let isClickView = !canEdit || isShiftStart || checkinTime || checkoutTime;

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
          key={shift.id + shift.timeId}
          shift={shift}
          isWeek={true}
          canEdit={canEdit}
          selectShiftIds={selectShiftIds}
          onSelectShiftId={onShiftSelect}
          notPublished={!shift.isPublished && !shift?.tags?.includes(4)}
          isEmployeeView={false}
          onClick={() => {
            onShiftItemClick(shift, isClickView);
          }}
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
