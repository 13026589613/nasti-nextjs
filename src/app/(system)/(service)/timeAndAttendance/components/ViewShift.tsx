import { useSetState } from "ahooks";
import React, { useEffect, useMemo, useState } from "react";

import { shiftBreakList } from "@/api/currentSchedule";
import { getTimeAndAttendanceInfo } from "@/api/timeAndAttendance";
import { TimeAndAttendanceVo } from "@/app/(system)/(service)/currentSchedule/types";
import CustomButton from "@/components/custom/Button";
import PageTitle from "@/components/PageTitle";
import useGlobalTime from "@/hooks/useGlobalTime";

import ShiftHistory from "../../currentSchedule/components/ShiftHistory";
import { ExceptionsDetail } from "../types";
import DetailLayout from "./DetailLayout";
import ShiftInfo from "./ShiftInfo";
export interface ViewShiftProps {
  id: string;
  shiftId: string;
  onClose?: () => void;
}

const ViewShift = (props: ViewShiftProps) => {
  const { id, onClose } = props;
  const [exceptionInfo, setExceptionInfo] = useSetState<{
    data: ExceptionsDetail | null;
    loading: boolean;
  }>({
    data: null,
    loading: false,
  });
  const shiftId = useMemo(() => {
    return exceptionInfo.data?.shiftId || "";
  }, [exceptionInfo.data]);
  const [tableData, setTableData] = useState<TimeAndAttendanceVo[]>([]);
  const getShiftBreakList = async () => {
    try {
      if (!shiftId) return;
      const { data, code } = await shiftBreakList(shiftId);
      if (code !== 200) return;
      const tableData = data.map((item: any) => {
        return {
          ...item,
          isApiData: true,
        };
      });
      setTableData(tableData);
    } catch (error) {}
  };
  useEffect(() => {
    getShiftBreakList();
  }, [exceptionInfo.data]);
  const { UTCMoment } = useGlobalTime();

  const getExceptionsDetail = async () => {
    try {
      setExceptionInfo({ loading: true });
      const { code, data } = await getTimeAndAttendanceInfo(id);
      if (code !== 200) return;
      const {
        locationNames,
        attendeeType,
        attendeeUsername,
        attendeeUserId,
        startTimeUtc,
        endTimeUtc,
        checkInUtc,
        checkOutUtc,
        communityId,
        note,
      } = data;
      setExceptionInfo({
        data: {
          ...data,
          communityId,
          attendeeType,
          note,
          locationId: "",
          locationName: locationNames || "",
          username: attendeeUsername || "",
          userId: attendeeUserId || "",
          startTimeLocal: startTimeUtc
            ? `${UTCMoment(startTimeUtc).format("MM/DD/YYYY hh:mm A")}`
            : "",
          endTimeLocal: endTimeUtc
            ? `${UTCMoment(endTimeUtc).format("MM/DD/YYYY hh:mm A")}`
            : "",
          checkInTimeLocal: checkInUtc
            ? `${UTCMoment(checkInUtc).format("MM/DD/YYYY hh:mm A")}`
            : "",
          checkOutTimeLocal: checkOutUtc
            ? `${UTCMoment(checkOutUtc).format("MM/DD/YYYY hh:mm A")}`
            : "",
          location: {
            lat:
              data.attendeeType === "CHECK_IN"
                ? data.checkinLat
                : data.checkoutLat,
            lng:
              data.attendeeType === "CHECK_IN"
                ? data.checkinLng
                : data.checkoutLng,
          },
        },
      });
    } finally {
      setExceptionInfo({ loading: false });
    }
  };
  useEffect(() => {
    getExceptionsDetail();
  }, [id]);

  return (
    <DetailLayout
      loading={exceptionInfo.loading}
      footerRender={
        <CustomButton
          onClick={onClose}
          variant={"outline"}
          className="w-[110px]"
        >
          Cancel
        </CustomButton>
      }
    >
      <PageTitle title="Shift Details" isClose={false} />
      {exceptionInfo.data && (
        <ShiftInfo tableData={tableData} data={exceptionInfo.data}></ShiftInfo>
      )}
      {exceptionInfo.data?.shiftId && (
        <ShiftHistory
          shiftId={exceptionInfo.data?.shiftId as string}
        ></ShiftHistory>
      )}
    </DetailLayout>
  );
};

export default ViewShift;
