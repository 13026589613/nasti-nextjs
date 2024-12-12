import { ScheduleShift, Statistic } from "@/api/currentSchedule/types";
import {
  HandleRoleShiftData,
  TemplateShiftRole,
} from "@/api/scheduleTemplates/types";
import useTimeStore from "@/store/useTimeStore";

interface ListData {
  label: string;
  value: string;
}
export default function sortListByKey(
  list: ListData[] | any[],
  key: string = "label"
) {
  return list.sort((a, b) => {
    const labelA = a[key].toLowerCase();
    const labelB = b[key].toLowerCase();
    if (labelA < labelB) {
      return -1;
    }
    if (labelA > labelB) {
      return 1;
    }
    return 0;
  });
}

type ShiftId = string;

const emptyShift = {
  id: "",
  startTimeUTC: "",
  endTimeUTC: "",
  userName: "",
  workerRoleId: "",
  workerRoleColor: "",
  workerRoleName: "",
  departmentName: "",
  userId: "",
  dayOfWeek: 0,
  startTimeLocal: "",
  endTimeLocal: "",
  shiftStartTime: "",
  shiftEndTime: "",
  shiftDate: "",
  scheduleId: "",
  communityId: "",
  departmentId: "",
  isShowEmpty: true,
} as ScheduleShift;

export const sortScheduleShiftList = (
  statistics: Statistic[],
  type: string
) => {
  let lastDateList: ShiftId[] = [];
  let resultLists: Statistic[] = [];

  statistics.forEach((statistic, dateIndex) => {
    let shifts = statistic.shifts || [];

    if (type === "role") {
      sortShiftRole(shifts);
    } else {
      sortShiftEmployee(shifts);
    }

    if (dateIndex === 0) {
      shifts.forEach((shift) => {
        lastDateList.push(shift.id);
        checkIsShow(shift);
      });

      resultLists.push({ ...statistic, shifts });
    } else {
      const copyLastDateList = [...lastDateList];
      lastDateList = [];

      let lastShift: ScheduleShift[] = [];
      let newShift: ScheduleShift[] = [];
      let maxIndex = -1;

      shifts.forEach((shift) => {
        const lastIndex = copyLastDateList.findIndex(
          (item) => item === shift.id
        );

        if (lastIndex !== -1) {
          newShift[lastIndex] = shift;
          maxIndex = lastIndex;
        } else {
          lastShift.push(shift);
        }

        checkIsShow(shift);
      });

      if (maxIndex + 1 <= shifts.length) {
        maxIndex = shifts.length - 1;
      }

      let lastShiftIndex = 0;
      for (let index = 0; index <= maxIndex; index++) {
        if (!newShift[index]) {
          if (lastShift[lastShiftIndex]) {
            newShift[index] = lastShift[lastShiftIndex];
            lastShiftIndex++;
            lastDateList.push(newShift[index].id);
          } else {
            newShift[index] = emptyShift;
            lastDateList.push("");
          }
        } else {
          lastDateList.push(newShift[index].id);
        }
      }

      resultLists.push({ ...statistic, shifts: newShift });
    }
  });

  // console.log(resultLists);

  return resultLists;
};

const checkIsShow = (shift: ScheduleShift) => {
  const { timeEndTime, timeStartTime, endTimeUTC, startTimeUTC } = shift;

  if (!timeStartTime || !timeEndTime) {
    return;
  }

  if (timeEndTime === endTimeUTC && timeStartTime === startTimeUTC) {
    return;
  }

  const isEndOfShift = useTimeStore
    .getState()
    .UTCMoment(timeEndTime)
    .isSame(useTimeStore.getState().UTCMoment(endTimeUTC), "minutes");

  if (isEndOfShift) {
    const startDate = useTimeStore
      .getState()
      .UTCMoment(endTimeUTC)
      .startOf("week");

    const isStartOfWeek = useTimeStore
      .getState()
      .UTCMoment(timeStartTime)
      .isSame(startDate, "day");

    if (!isStartOfWeek) {
      shift.isShowEmpty = true;
    }
  }

  const isStartOfShift = useTimeStore
    .getState()
    .UTCMoment(timeStartTime)
    .isSame(useTimeStore.getState().UTCMoment(startTimeUTC), "minutes");

  if (isStartOfShift) {
    const endDate = useTimeStore
      .getState()
      .UTCMoment(startTimeUTC)
      .endOf("week");
    const isEndOfWeek = useTimeStore
      .getState()
      .UTCMoment(startTimeUTC)
      .isSame(endDate, "day");

    if (!isEndOfWeek) {
      shift.isCrossDayStart = true;
    }
  }
};

const sortShiftRole = (shifts: ScheduleShift[]) => {
  const UTCMoment = useTimeStore.getState().UTCMoment;
  shifts.sort((a, b) => {
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
};

const sortShiftEmployee = (shifts: ScheduleShift[]) => {
  const UTCMoment = useTimeStore.getState().UTCMoment;

  shifts.sort((a, b) => {
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
};

// const templateEmptyShift: TemplateShift = {
//   id: "",
//   shiftId: "",
//   templateId: "",
//   communityId: "",
//   departmentId: "",
//   departmentName: "",
//   workerRoleId: "",
//   workerRoleName: "",
//   workerRoleColor: "",
//   userId: "",
//   userName: "",
//   startTime: "",
//   endTime: "",
//   dayOfWeek: "",
//   durationMins: "",
//   timeOut: false,
//   isMultiDay: false,
// };

export const sortTemplateShiftList = (data: TemplateShiftRole[]) => {
  return [] as HandleRoleShiftData[];
};
