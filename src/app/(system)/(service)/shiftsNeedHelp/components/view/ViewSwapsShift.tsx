import { useEffect, useMemo, useState } from "react";
import React from "react";

import CustomButton from "@/components/custom/Button";
import CustomTable, {
  CustomColumnDef,
  RefProps,
} from "@/components/custom/Table";
import Tooltip from "@/components/custom/Tooltip";
import PageTitle from "@/components/PageTitle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";

import ShiftHistory from "../../../currentSchedule/components/ShiftHistory";
import { NeedHelpShift, SwapsData } from "../../types";
import { isOverTime } from "../../utils";
import ChatIcon from "../ChatIcon";
import DetailLayout from "../DetailLayout";
import ShiftInfo from "../ShiftInfo";
export interface ReviewNeedHelpShiftProps {
  needHelpShift: NeedHelpShift;
  onClose?: () => void;
}

const ReviewSwapsShift = (props: ReviewNeedHelpShiftProps) => {
  const { needHelpShift, onClose } = props;
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    needHelpShift.employeeList.map((employee) => {
      if (employee.status) setSelected(employee.id);
    });
  }, [needHelpShift.employeeList]);
  // const [swapsData] = useState<SwapsData[]>([]);
  const tableRef = React.createRef<RefProps>();

  let columns: CustomColumnDef<SwapsData>[] = useMemo(() => {
    let columnsInner: CustomColumnDef<SwapsData>[] = [
      {
        accessorKey: "employee",
        header: () => {
          return (
            <div className="flex items-center gap-4 cursor-pointer w-full h-full">
              Employee
            </div>
          );
        },
        cell: ({ row }) => {
          const { employee, userId, tags } = row.original;
          return (
            <div className="flex items-center gap-4 cursor-pointer w-full h-full">
              {employee} <ChatIcon targetUserId={userId} />
              <div className="flex items-center justify-center w-6 h-4 mb-[4px]">
                {isOverTime(tags) && (
                  <Tooltip content={"Overtime"}>
                    <OvertimeIcon width="16px" height="16px"></OvertimeIcon>
                  </Tooltip>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: () => {
          return (
            <div className="flex items-center cursor-pointer w-full h-full">
              Phone Number
            </div>
          );
        },
        cell: ({ row }) => <div>{row.getValue("phone")}</div>,
      },
      {
        accessorKey: "shiftEndTime",
        header: () => {
          return (
            <div className="flex items-center cursor-pointer w-full h-full">
              Shift Date Time
            </div>
          );
        },
        cell: ({ row }) => {
          const { shiftDate, shiftEndTime, shiftStartTime, shiftDateTime } =
            row.original;
          return (
            <div>
              {shiftDateTime
                ? shiftDateTime
                : `${shiftDate} ${shiftStartTime} - ${shiftDate} ${shiftEndTime}`}
            </div>
          );
        },
      },
      {
        accessorKey: "location",
        header: () => {
          return (
            <div className="flex items-center cursor-pointer w-full h-full">
              Location
            </div>
          );
        },
        cell: ({ row }) => <div>{row.getValue("location")}</div>,
      },
      {
        accessorKey: "note",
        header: () => {
          return (
            <div className="flex items-center cursor-pointer w-full h-full">
              Notes
            </div>
          );
        },
        cell: ({ row }) => <div>{row.getValue("note")}</div>,
      },
    ];
    if (needHelpShift.status === "APPROVED") {
      columnsInner = [
        {
          id: "select",
          width: 50,
          header: () => {
            return <></>;
          },
          cell: ({ row }) => {
            return (
              <RadioGroupItem
                disabled={true}
                value={row.original.id}
              ></RadioGroupItem>
            );
          },
          enableSorting: false,
          enableHiding: false,
        },
        ...columnsInner,
      ];
    }
    return columnsInner;
  }, [needHelpShift.status]);

  return (
    <DetailLayout
      footerRender={
        <div className="flex justify-end">
          <CustomButton
            onClick={onClose}
            variant={"outline"}
            className="w-[110px]"
          >
            Cancel
          </CustomButton>
        </div>
      }
    >
      <div className="pb-5">
        <PageTitle title="Shift Details" isClose={false} />
        <ShiftInfo
          currentView={"shiftSwaps"}
          needHelpShift={needHelpShift}
        ></ShiftInfo>

        <div className="mt-6 mb-1 text-[18px] font-[450] leading-10">
          Employees that accepted the swap request
        </div>

        <RadioGroup
          value={selected}
          onChange={(value) => {
            setSelected(value);
          }}
        >
          <CustomTable
            ref={tableRef}
            lightIndex={selected}
            adaptive={false}
            height="auto"
            tableClassName="min-h-200px"
            columns={columns}
            data={needHelpShift.employeeList}
          />
        </RadioGroup>

        {/* <ShiftHistory shiftId={needHelpShift.id}></ShiftHistory> */}
        <ShiftHistory shiftId={needHelpShift.shiftId || ""}></ShiftHistory>
      </div>
    </DetailLayout>
  );
};

export default ReviewSwapsShift;
