import { useImmer } from "use-immer";

import Input from "@/components/custom/Input";
import Tooltip from "@/components/custom/Tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EditIcon from "~/icons/EditIcon.svg";

interface ViewRoleHHPDProps {
  targetHPPD: string | undefined;
  plannedHPPD: number;
  assignedHPPD: number;
  onUpdateTargetHPPD: (value: number) => void;
}

const ViewRoleHHPD = (props: ViewRoleHHPDProps) => {
  const { targetHPPD, plannedHPPD, assignedHPPD, onUpdateTargetHPPD } = props;

  const [targetHPPDValue, setTargetHPPDValue] = useImmer<string | number>(
    targetHPPD ?? ""
  );

  return (
    <div className="p-[10px_0] text-[15px]">
      <div className="flex mb-[5px] relative">
        <div className="mr-[5px]">Target HPPD:</div>
        <div className="flex-1">{targetHPPD ?? "-"}</div>
        <div className="absolute right-[-5px]">
          <Popover
            onOpenChange={(value) => {
              // value is true when popover is opened
              if (!value && targetHPPD !== targetHPPDValue) {
                onUpdateTargetHPPD(Number(targetHPPDValue));
              }
            }}
          >
            <Tooltip content="Edit Target HPPD for This Day">
              <PopoverTrigger asChild>
                <div>
                  <EditIcon width="16px" height="16px" color="#3FBD6B" />
                </div>
              </PopoverTrigger>
            </Tooltip>
            <PopoverContent>
              <div className="flex items-center">
                <div className="w-[160px]">Target HPPD:</div>
                <div>
                  <Input
                    type="number"
                    className="h-[30px] remove-number-input-arrows text-[#000]"
                    placeholder="Target HPPD"
                    value={targetHPPDValue}
                    onChange={(e) => {
                      setTargetHPPDValue(e.target.value);
                    }}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex mb-[5px]">
        <div className="mr-[5px]">Planned HPPD:</div>
        <div className="flex-1">{plannedHPPD ?? "-"}</div>
      </div>
      <div className="flex">
        <div className="mr-[5px]">Assigned HPPD:</div>
        <div className="flex-1">{assignedHPPD ?? "-"}</div>
      </div>
    </div>
  );
};

export default ViewRoleHHPD;
