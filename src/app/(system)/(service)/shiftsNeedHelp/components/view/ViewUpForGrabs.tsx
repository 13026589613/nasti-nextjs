import { useEffect, useMemo, useState } from "react";
import React from "react";

import CustomButton from "@/components/custom/Button";
import CustomTable, {
  CustomColumnDef,
  RefProps,
} from "@/components/custom/Table";
import PageTitle from "@/components/PageTitle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useGlobalTime from "@/hooks/useGlobalTime";

// import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";
import ShiftHistory from "../../../currentSchedule/components/ShiftHistory";
import { ShiftUfgRequestListRes, UfgShiftClaim } from "../../types";
import ChatIcon from "../ChatIcon";
import DetailLayout from "../DetailLayout";
import ShiftInfo from "../ShiftInfo";

export interface ReviewNeedHelpShiftProps {
  needHelpShift: ShiftUfgRequestListRes;
  onClose?: () => void;
}

const ViewUpForGrabs = (props: ReviewNeedHelpShiftProps) => {
  const { needHelpShift, onClose } = props;
  const [selected, setSelected] = useState<any>(null);
  const tableRef = React.createRef<RefProps>();

  const { UTCMoment, zoneAbbr } = useGlobalTime();

  let columns: CustomColumnDef<UfgShiftClaim>[] = useMemo(() => {
    let columnsInner: CustomColumnDef<UfgShiftClaim>[] = [
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
          const { claimedBy, username } = row.original;
          return (
            <div className="flex items-center gap-4 cursor-pointer w-full h-full">
              {username} <ChatIcon targetUserId={claimedBy} />
              {/* <OvertimeIcon className="w-4 h-4"></OvertimeIcon> */}
            </div>
          );
        },
      },
      {
        accessorKey: "nationalPhone",
        header: () => {
          return (
            <div className="flex items-center cursor-pointer w-full h-full">
              Phone Number
            </div>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nationalPhone")}</div>,
      },
      {
        accessorKey: "shiftEndTime",
        header: () => {
          return (
            <div className="flex items-center cursor-pointer w-full h-full">
              Claimed Date Time
            </div>
          );
        },
        cell: ({ row }) => {
          const { createdAt } = row.original;
          return (
            <div>
              {`${UTCMoment(createdAt).format(
                "MM/DD/YYYY hh:mm A"
              )} (${zoneAbbr})`}
            </div>
          );
        },
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
            const { status } = row.original;
            const isCheck = status === "APPROVED";
            return (
              <RadioGroupItem
                disabled={true}
                checked={isCheck}
                onClick={() => {
                  tableRef.current?.clearSelectedRows();
                  row.toggleSelected(true);
                  setSelected(row.original.id);
                }}
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

  useEffect(() => {
    if (needHelpShift.claimList && needHelpShift.claimList.length > 0) {
      const user = needHelpShift.claimList.find((item) => {
        if (item.status === "APPROVED") {
          return true;
        }
      });
      if (user) {
        setSelected(user.id);
        tableRef.current?.setRowSelection(user.id);
      }
    }
  }, [needHelpShift]);

  return (
    <DetailLayout
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
      <ShiftInfo
        currentView={"upForGrabs"}
        needHelpShift={needHelpShift}
      ></ShiftInfo>

      {needHelpShift.claimList && needHelpShift.claimList.length > 0 && (
        <>
          <div className="mt-6 mb-1 text-[18px] font-[450] leading-10">
            Employees that claimed this shift
          </div>
          <RadioGroup
            value={selected}
            onChange={(value) => {
              setSelected(value);
            }}
          >
            <CustomTable
              ref={tableRef}
              columns={columns}
              data={needHelpShift.claimList}
              lightIndex={selected}
              adaptive={false}
              height="auto"
              tableClassName="min-h-200px"
            />
          </RadioGroup>
        </>
      )}

      <ShiftHistory shiftId={needHelpShift.shiftId}></ShiftHistory>
    </DetailLayout>
  );
};

export default ViewUpForGrabs;
