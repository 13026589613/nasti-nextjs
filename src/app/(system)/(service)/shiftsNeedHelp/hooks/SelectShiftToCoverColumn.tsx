"use client";

import DatePicker from "@/components/custom/DatePicker";
import { CustomColumnDef } from "@/components/custom/Table";
import TimePicker from "@/components/custom/TimePicker";
import useGlobalTime from "@/hooks/useGlobalTime";
import Delete from "~/icons/DeleteIcon.svg";

import ChatIcon from "../components/ChatIcon";
import { CandidateShifts } from "../types";

interface UseSelectShiftToCoverColumn {
  onClick: (value: string) => void;
  selectedShift: CandidateShifts[];
  setSelectedShift: (value: CandidateShifts[]) => void;
}

const useSelectShiftToCoverColumn = (props: UseSelectShiftToCoverColumn) => {
  const { onClick, selectedShift, setSelectedShift } = props;

  const { UTCMoment, localMoment, zoneAbbr } = useGlobalTime();

  const setTime = ({
    startTime,
    endTime,
    id,
  }: {
    startTime: string;
    endTime: string;
    id: string;
  }) => {
    const newSelectedShift = selectedShift.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          startTimeUTC: startTime,
          endTimeUTC: endTime,
        };
      }
      return item;
    });
    setSelectedShift(newSelectedShift);
  };

  const columns: CustomColumnDef<CandidateShifts>[] = [
    {
      accessorKey: "userName",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full font-[390]">
            Employee
          </div>
        );
      },
      cell: ({ row }) => {
        const { userName, userId } = row.original;
        return (
          <div className="flex items-center gap-4 cursor-pointer w-full h-full">
            {userName && (
              <>
                {userName} <ChatIcon targetUserId={userId} />
              </>
            )}
            {!userName && (
              <div className="flex items-center justify-center w-[70px] h-[32px] border border-[#F2994A] text-[14px] text-[#F2994A] font-[390]">
                OPEN
              </div>
            )}
            {/* <OvertimeIcon className="w-4 h-4"></OvertimeIcon> */}
          </div>
        );
      },
    },
    {
      accessorKey: "userPhone",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full font-[390]">
            Phone Number
          </div>
        );
      },
      cell: ({ row }) => <div>{row.getValue("userPhone")}</div>,
    },
    {
      accessorKey: "startTimeUTC",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full font-[390]">
            Shift Date Time
          </div>
        );
      },
      cell: ({ row }) => {
        const { startTimeUTC, endTimeUTC } = row.original;
        return (
          <div className="max-w-[200px]">
            {`${UTCMoment(startTimeUTC).format(
              "MM/DD/YYYY hh:mm A"
            )} - ${UTCMoment(endTimeUTC).format(
              "MM/DD/YYYY hh:mm A"
            )} (${zoneAbbr})`}
          </div>
        );
      },
    },
    {
      accessorKey: "locationRefVOs",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full font-[390]">
            Location
          </div>
        );
      },
      cell: ({ row }) => {
        const { locationRefVOs } = row.original;
        return (
          <div className="max-w-[150px] break-words">
            {locationRefVOs?.map((item) => item.locationName)?.join(",")}
          </div>
        );
      },
    },
    {
      accessorKey: "shiftEndTime",
      width: "40%",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full font-[390]">
            New Shift Date Time
          </div>
        );
      },
      cell: ({ row }) => {
        const { startTimeUTC, endTimeUTC } = row.original;
        const startDate = UTCMoment(startTimeUTC).format("MM/DD/YYYY");
        const startTime = UTCMoment(startTimeUTC).format("hh:mm A");
        const endDate = UTCMoment(endTimeUTC).format("MM/DD/YYYY");
        const endTime = UTCMoment(endTimeUTC).format("hh:mm A");

        const showEqualError = UTCMoment(startTimeUTC).isSame(
          UTCMoment(endTimeUTC)
        );
        const showBeforeError = UTCMoment(startTimeUTC).isAfter(
          UTCMoment(endTimeUTC)
        );

        return (
          <div>
            <div className="flex flex-wrap gap-1 items-center justify-center">
              <div className="flex-1 flex items-center gap-1 flex-nowrap">
                <div className="min-w-[140px]">
                  <DatePicker
                    allowClear={false}
                    value={startDate}
                    style={{
                      color: "#00000040",
                      fontWeight: 900,
                    }}
                    onChange={(value) => {
                      setTime({
                        startTime: localMoment(
                          value + " " + startTime,
                          "MM/DD/YYYY hh:mm A"
                        )
                          .utc()
                          .format(),
                        endTime: endTimeUTC,
                        id: row.original.id,
                      });
                    }}
                  />
                </div>
                <div className="min-w-[125px]">
                  <TimePicker
                    value={startTime}
                    style={{
                      color: "#00000040",
                      fontWeight: 900,
                    }}
                    onChange={(data) => {
                      setTime({
                        startTime: localMoment(
                          startDate + " " + data,
                          "MM/DD/YYYY hh:mm A"
                        )
                          .utc()
                          .format(),
                        endTime: endTimeUTC,
                        id: row.original.id,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="w-[8px]">-</div>
              <div className="flex-1 flex items-center gap-1 flex-nowrap">
                <div className="min-w-[140px]">
                  <DatePicker
                    allowClear={false}
                    value={endDate}
                    style={{
                      color: "#00000040",
                      fontWeight: 900,
                    }}
                    onChange={(value) => {
                      setTime({
                        startTime: startTimeUTC,
                        endTime: localMoment(
                          value + " " + endTime,
                          "MM/DD/YYYY hh:mm A"
                        )
                          .utc()
                          .format(),
                        id: row.original.id,
                      });
                    }}
                  />
                </div>
                <div className="min-w-[125px]">
                  <TimePicker
                    value={endTime}
                    style={{
                      color: "#00000040",
                      fontWeight: 900,
                    }}
                    onChange={(data) => {
                      setTime({
                        startTime: startTimeUTC,
                        endTime: localMoment(
                          endDate + " " + data,
                          "MM/DD/YYYY hh:mm A"
                        )
                          .utc()
                          .format(),
                        id: row.original.id,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            {showEqualError && (
              <div className="text-sm h-5 text-[#ec4899] pt-[6px] font-[400]">
                Start Date Time cannot be equal to End Date Time.
              </div>
            )}
            {showBeforeError && (
              <div className="text-sm h-5 text-[#ec4899] pt-[6px] font-[400]">
                Start Date Time cannot be later than End Date Time.
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "option",
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full font-[390]">
            Action
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <Delete
            className="cursor-pointer"
            width={16}
            color={"#13227A"}
            onClick={() => {
              onClick(row.original.id);
            }}
          ></Delete>
        );
      },
    },
  ];

  return {
    columns,
  };
};

export default useSelectShiftToCoverColumn;
