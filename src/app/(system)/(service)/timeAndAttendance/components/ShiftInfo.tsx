import { useRef } from "react";

import useReturnTableColumn from "@/app/(system)/(service)/currentSchedule/components/timeAndAttendance/tableColumn";
import { TimeAndAttendanceVo } from "@/app/(system)/(service)/currentSchedule/types";
import FormItemLabel from "@/components/custom/FormItemLabel";
import CustomTable, { RefProps } from "@/components/custom/Table";
import { EXCEPTION_REASON } from "@/constant/statusConstants";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";

import ChatIcon from "../../shiftsNeedHelp/components/ChatIcon";
import { ExceptionReason, ExceptionsDetail } from "../types";

interface ShiftInfoProps {
  tableData: TimeAndAttendanceVo[];
  data: ExceptionsDetail;
  messageClick?: () => void;
}
const ShiftInfo = (props: ShiftInfoProps) => {
  const { data, tableData } = props;

  const { zoneAbbr } = useGlobalTime();

  const tableRef = useRef<RefProps>();
  const showReasonView = !!data.reason;
  const { columns } = useReturnTableColumn({});
  return (
    <div className="w-full mt-4">
      <div className="flex items-center">
        <div className="mr-4 text-[18px] font-[450] leading-10">
          Exception Reason
        </div>
        <Status
          status={
            data.status.includes("BREAK_TIME")
              ? "BREAK_TIME_EXCEPTION"
              : data.status
          }
        ></Status>
      </div>
      <div className="flex flex-wrap justify-between w-full">
        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label={"Department"}>
            <div className="min-h-10 text-[#919FB4]">
              {data?.departmentName}
            </div>
          </FormItemLabel>
        </div>
        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label={"Location"}>
            <div className="min-h-10 text-[#919FB4]">{data?.locationName}</div>
          </FormItemLabel>
        </div>
        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label={"Role"}>
            <div className="min-h-10 text-[#919FB4]">
              {data?.workerRoleName}
            </div>
          </FormItemLabel>
        </div>
        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label={"Employee"}>
            <div className="min-h-10 text-[#919FB4] flex items-center gap-4">
              <span>{data?.username}</span>

              <ChatIcon targetUserId={data?.userId} />
            </div>
          </FormItemLabel>
        </div>
        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label={"Shift Date Time"}>
            <div className="min-h-10 text-[#919FB4]">
              {data.startTimeLocal && data.endTimeLocal
                ? `${data.startTimeLocal} - ${data.endTimeLocal} (${zoneAbbr})`
                : ""}
            </div>
          </FormItemLabel>
        </div>
        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label={"Phone Number"}>
            <div className="min-h-10 text-[#919FB4]">{data.nationalPhone}</div>
          </FormItemLabel>
        </div>
        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label="Check-in Time">
            <div className="min-h-10 text-[#919FB4]">
              {data.checkInTimeLocal
                ? `${data.checkInTimeLocal} (${zoneAbbr})`
                : ""}
            </div>
          </FormItemLabel>
        </div>
        <div className="w-[calc(50%-10px)]">
          <FormItemLabel label="Check-out Time">
            <div className="min-h-10 text-[#919FB4]">
              {data.checkOutTimeLocal
                ? `${data.checkOutTimeLocal} (${zoneAbbr})`
                : ""}
            </div>
          </FormItemLabel>
        </div>

        <div className="w-full">
          <FormItemLabel label={"Notes"}>
            <div className="min-h-10 text-[#919FB4]">{data.note}</div>
          </FormItemLabel>
        </div>
        {showReasonView && (
          <div className="w-full">
            <FormItemLabel label={"Reason for the call-off"}>
              <div className="min-h-10 text-[#919FB4]">{data.reason}</div>
            </FormItemLabel>
          </div>
        )}
      </div>
      <CustomTable
        className="mt-4 min-h-[100px]"
        height="auto"
        adaptive={false}
        columns={columns}
        data={tableData}
        loading={false}
        ref={tableRef}
        manualPagination={true}
      />
    </div>
  );
};

export default ShiftInfo;

const Status = (props: { status: ExceptionReason }) => {
  const { status } = props;
  const statusColor = {
    NO_SHOW: {
      background: "bg-[#E6FFFB]",
      text: "text-[#13C2C2]",
      border: "border-[#87E8DE]",
    },
    CHECKED_IN: {
      background: "bg-[#FFF0F6]",
      text: "text-[#EB2F96]",
      border: "border-[#F9D9E8]",
    },
    LATE_CHECK_IN: {
      background: "bg-[#FFF0F6]",
      text: "text-[#EB2F96]",
      border: "border-[#F9D9E8]",
    },
    NOT_CHECKED_IN: {
      background: "bg-[#E6FFFB]",
      text: "text-[#13C2C2]",
      border: "border-[#87E8DE]",
    },
    CHECKED_OUT: {
      background: "bg-[#FFF0F6]",
      text: "text-[#EB2F96]",
      border: "border-[#F9D9E8]",
    },
    EARLY_CHECK_OUT: {
      background: "bg-[#FFF1F5]",
      text: "text-[#FF4874]",
      border: "border-[#FF85A2]",
    },
    LATE_CHECK_OUT: {
      background: "bg-[#F9F0FF]",
      text: "text-[#722ED1]",
      border: "border-[#D3ADF7]",
    },

    LATE_CHECK_OUT_ONGOING: {
      background: "bg-[#E6F7FF]",
      text: "text-[#1890FF]",
      border: "border-[#B7E1FB]",
    },
    LEFT_WITHOUT_CHECKING_OUT: {
      background: "bg-[#FEF4E8]",
      text: "text-[#AD6602]",
      border: "border-[#E8CB9C]",
    },

    BREAK_TIME_EXCEPTION: {
      background: "bg-[#DFE2F3]",
      text: "text-[#1132D9]",
      border: "border-[#7789E5]",
    },
  };

  return (
    <div
      className={cn(
        "flex items-center w-fit h-6 rounded-[12px] px-3 border border-dashed",
        statusColor[status].background,
        statusColor[status].text,
        statusColor[status].border
      )}
    >
      <span>{EXCEPTION_REASON[status]}</span>
    </div>
  );
};
