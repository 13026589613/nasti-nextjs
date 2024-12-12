import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { getCommunityInfo } from "@/api/community";
import { scheduleShiftInfo } from "@/api/currentSchedule";
import { saveShiftBreak } from "@/api/currentSchedule";
import { ScheduleShift } from "@/api/currentSchedule/types";
import { ScheduleShiftCreateParams } from "@/api/currentSchedule/types";
import { timeAndAttendanceUpdate } from "@/api/timeAndAttendance";
import CustomButton from "@/components/custom/Button";
import Dialog from "@/components/custom/Dialog";
import InputReview from "@/components/custom/review/InputReview";
import MultipleInputView from "@/components/custom/review/MultipleInputView";
import { MESSAGE } from "@/constant/message";
import useGlobalTime from "@/hooks/useGlobalTime";
import useHasPermission from "@/hooks/useHasPermission";

import { LocationInfo } from "../types";
import ShiftHistory from "./ShiftHistory";
import TimeAndAttendanceSetting from "./timeAndAttendance";

type AddShiftDialogDialogProps = {
  communityId: string;
  shiftId: string;
  currentSchedule: string;
  onClose: () => void;
  onSuccess: (departmentId: string) => void;
};

const ViewShiftDialog = (props: AddShiftDialogDialogProps) => {
  const { communityId, shiftId, currentSchedule, onClose, onSuccess } = props;

  const { UTCMoment, localMoment, zoneAbbr } = useGlobalTime();
  const { isHasApproveAttendancePermission } = useHasPermission();
  const [dialogLoading, setDialogLoading] = useState(false);
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    checkin: { lng: null, lat: null },
    checkout: { lng: null, lat: null },
  });
  const [hasDraftSchedule] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isShiftPublish, setIsShiftPublish] = useState(false);
  const [shiftData, setShiftData] = useState<ScheduleShift | null>(null);
  const timeAndAttendanceSettingRef = useRef<any>(null);
  const [checkInUTC, setCheckInUTC] = useState<string>("");
  const [checkOutUTC, setCheckOutUTC] = useState<string>("");
  const [isOpenSchedule, setIsOpenSchedule] = useState<boolean>(false);
  const loadGetShiftInfo = () => {
    setDialogLoading(true);

    scheduleShiftInfo(shiftId)
      .then(({ code, data }) => {
        if (code !== 200) return;
        const {
          checkinTime,
          checkoutTime,
          checkinLat,
          checkinLng,
          checkoutLat,
          checkoutLng,
          isPublished,
          tags,
          userName,
        } = data;
        setIsShiftPublish(isPublished);
        setIsOpenSchedule(!userName);

        if (tags && tags.length > 0) {
          if (!isPublished && tags.includes(4)) {
            setIsShiftPublish(true);
          }
        }

        if (checkinTime) {
          setCheckInUTC(checkinTime);
        }
        if (checkoutTime) {
          setCheckOutUTC(checkoutTime);
        }

        setLocationInfo({
          checkin: {
            lat: checkinLat || null,
            lng: checkinLng || null,
          },
          checkout: {
            lat: checkoutLat || null,
            lng: checkoutLng || null,
          },
        });
        data.shiftDate = UTCMoment(data.startTimeUTC).format("MM/DD/YYYY");
        data.shiftStartTime = UTCMoment(data.startTimeUTC).format("hh:mm A");
        data.shiftEndTime = UTCMoment(data.endTimeUTC).format("hh:mm A");

        setShiftData(data);
      })
      .finally(() => {
        setDialogLoading(false);
      });
  };
  const {
    control,
    formState: { errors },
    handleSubmit,
    // watch,
    // setValue,
    // setError,
    // getValues,
  } = useForm<ScheduleShiftCreateParams>({
    defaultValues: {
      scheduleId: null,
      departmentId: "",
      departmentName: "",
      locationIds: [],
      locationNames: [],
      workerRoleId: "",
      workerRoleName: "",
      userId: "",
      shiftStartTime: "",
      shiftEndTime: "",
      shiftDate: [],
      note: "",
    },
  });
  useEffect(() => {
    loadGetShiftInfo();
  }, []);
  const handleChangeCheck = async () => {
    try {
      const { checkin, checkout } =
        timeAndAttendanceSettingRef.current.getCheckData();
      const param = {
        shiftId,
        communityId,
        checkInTime: checkin
          ? moment(checkin, "MM/DD/YYYY hh:mm A").format("MM/DD/YYYY HH:mm:ss")
          : null,
        checkOutTime: checkout
          ? moment(checkout, "MM/DD/YYYY hh:mm A").format("MM/DD/YYYY HH:mm:ss")
          : null,
      };
      await timeAndAttendanceUpdate(param);
    } finally {
    }
  };

  const saveShiftBreakData = async (ref: any) => {
    try {
      const { tableData, backupTableData } = ref.getTableData();
      if (JSON.stringify(tableData) === JSON.stringify(backupTableData)) return;
      const breakList = tableData.map((item: any) => {
        const { id, durationMins, breakType, isApiData } = item;
        return {
          id: isApiData ? id : undefined,
          durationMins,
          breakType,
          communityId,
          shiftId,
        };
      });
      const params = {
        actionType: 1,
        shiftId,
        communityId,
        breakList,
      };
      const { code } = await saveShiftBreak(params);
      if (code === 200) {
        toast.success(MESSAGE.save, {
          position: "top-center",
        });
      }
    } catch (error) {}
  };

  const onSubmit = async (
    formData: ScheduleShiftCreateParams,
    isPublish: boolean
  ) => {
    setSubmitLoading(true);
    try {
      const settingRef = timeAndAttendanceSettingRef?.current;
      if (settingRef) {
        const checkInData = settingRef.getCheckInData();
        const checkOutData = settingRef.getCheckOutData();
        const checkInDataTimeMoment = localMoment(
          `${checkInData.date} ${checkInData.time}`,
          "MM/DD/YYYY hh:mm A"
        );
        const checkOutDataTimeMoment = localMoment(
          `${checkOutData.date} ${checkOutData.time}`,
          "MM/DD/YYYY hh:mm A"
        );
        const isSame = checkOutDataTimeMoment.isSame(checkInDataTimeMoment);
        const isBefore = checkOutDataTimeMoment.isBefore(checkInDataTimeMoment);
        if (isSame || isBefore) {
          toast.error(
            "The Check Out Time must be greater than the Check In Time.",
            {
              position: "top-center",
            }
          );
          return;
        }

        let checkMins = checkOutDataTimeMoment.diff(
          checkInDataTimeMoment,
          "minutes"
        );

        const { tableData } =
          timeAndAttendanceSettingRef.current.getTableData();
        const totalDurationMins = tableData.reduce((acc: any, current: any) => {
          return acc + parseInt(current.durationMins, 10);
        }, 0);
        if (totalDurationMins >= checkMins) {
          toast.warning(
            "The recorded breaks cannot exceed or equal the worked hours.",
            {
              position: "top-center",
            }
          );
        } else {
          if (!isSame) await handleChangeCheck();
          await saveShiftBreakData(settingRef);
          onSuccess(formData.departmentId);
          onClose();
        }
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const [attendanceEnabled, setAttendanceEnabled] = useState<boolean>(false);
  const communityInfo = async () => {
    const { code, data } = await getCommunityInfo(communityId);
    if (code === 200 && data) {
      setAttendanceEnabled(data.attendanceEnabled);
    }
  };
  useEffect(() => {
    communityId && communityInfo();
  }, [communityId]);

  const isOverTimeOrUnpublished = useMemo(() => {
    if (!shiftData) return false;
    const { tags, isPublished } = shiftData;
    const nowTags = tags || [];

    // 4: OVERTIME_PENDING_APPROVAL 5:OVERTIME_REJECTED
    return [4, 5].some((item) => nowTags.includes(item)) || !isPublished;
  }, [shiftData]);

  const isShowTimeAndAttendence = useMemo(
    () => attendanceEnabled && !isOpenSchedule && !isOverTimeOrUnpublished,
    [attendanceEnabled, isOpenSchedule, isOverTimeOrUnpublished]
  );

  const isShowSave = useMemo(
    () => isHasApproveAttendancePermission && isShowTimeAndAttendence,
    [isHasApproveAttendancePermission, isShowTimeAndAttendence]
  );
  return (
    <Dialog
      open
      width="550px"
      title={"Shift Detail"}
      onClose={onClose}
      loading={dialogLoading}
      footer={
        <div>
          <CustomButton
            onClick={onClose}
            variant={"outline"}
            className="w-[110px]"
          >
            Cancel
          </CustomButton>

          {isShowSave && (
            <CustomButton
              loading={submitLoading}
              colorStyle={
                ((shiftId && !isShiftPublish && !hasDraftSchedule) ||
                  (!shiftId && !hasDraftSchedule)) &&
                currentSchedule === "Weekly"
                  ? "yellow"
                  : undefined
              }
              className="w-[110px] ml-[22px]"
              onClick={handleSubmit((data) => {
                onSubmit(data, false);
              })}
            >
              Save
            </CustomButton>
          )}
        </div>
      }
      contentWrapperClassName="pr-1"
    >
      <div className="overflow-y-auto overflow-x-hidden w-full max-h-[calc(100vh-180px)] pr-3 pb-4">
        <InputReview
          label="Department"
          value={shiftData?.departmentName}
        ></InputReview>
        <MultipleInputView
          label="Location"
          value={shiftData?.locationRefVOs?.map((item) => item.locationName)}
        ></MultipleInputView>
        <InputReview
          label="Role"
          value={shiftData?.workerRoleName}
        ></InputReview>

        <InputReview
          label="Shift Date"
          value={`${shiftData?.shiftDate} (${zoneAbbr})`}
        ></InputReview>
        <InputReview
          label="Shift Time"
          value={
            <div className="flex items-center gap-4 test-[#666666]">{`${shiftData?.shiftStartTime} - ${shiftData?.shiftEndTime} (${zoneAbbr})`}</div>
          }
        ></InputReview>
        <InputReview label="Employee" value={shiftData?.userName}></InputReview>
        <InputReview label="Notes" value={shiftData?.note}></InputReview>
        {isShowTimeAndAttendence && (
          <TimeAndAttendanceSetting
            ref={timeAndAttendanceSettingRef}
            shiftId={shiftId}
            control={control}
            errors={errors}
            checkInUTC={checkInUTC}
            checkOutUTC={checkOutUTC}
            locationInfo={locationInfo}
            isHasApproveAttendancePermission={isHasApproveAttendancePermission}
          ></TimeAndAttendanceSetting>
        )}

        {shiftId && (
          <ShiftHistory className="px-0" shiftId={shiftId}></ShiftHistory>
        )}
      </div>
    </Dialog>
  );
};
export default ViewShiftDialog;
