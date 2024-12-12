import { useEffect, useState } from "react";
import { useImmer } from "use-immer";

import Input from "@/components/custom/Input";
import Tooltip from "@/components/custom/Tooltip";
import { cn } from "@/lib/utils";
import { hexToRgba, isBlackRange } from "@/utils/hexToRgba";
import EditIcon from "~/icons/EditIcon.svg";

type TargetHPPDProps = {
  defaultValue: string | undefined;
  disabled?: boolean;
  isWeekly?: boolean;
  onBlur: (value: number) => void;
  roleColor: string;
};

const TargetHPPD = (props: TargetHPPDProps) => {
  const {
    defaultValue = "",
    disabled = false,
    isWeekly = false,
    onBlur,
    roleColor,
  } = props;

  const [targetHPPDValue, setTargetHPPDValue] = useState<string | undefined>(
    defaultValue
  );

  const [isEdit, setIsEdit] = useImmer<boolean>(false);

  useEffect(() => {
    setTargetHPPDValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="flex items-center relative h-[30px]">
      <div
        className={cn(
          "mr-[5px] text-[16px] whitespace-nowrap overflow-hidden text-ellipsis",
          !isWeekly && "mr-[20px]"
        )}
      >
        Target HPPD:
      </div>

      {isEdit ? (
        <Input
          autoFocus
          disabled={disabled}
          type="number"
          className={cn(
            "h-[30px] w-[80px] remove-number-input-arrows mt-[5px] p-[0_5px] border-[#EB1DB2] text-[#000]"
          )}
          value={targetHPPDValue}
          onChange={(e) => {
            setTargetHPPDValue(e.target.value);
          }}
          onBlur={() => {
            setIsEdit(false);

            if (targetHPPDValue !== defaultValue) {
              onBlur(Number(targetHPPDValue) ?? 0);
            }
          }}
        />
      ) : (
        <div
          className={cn("text-[#837c88]", !isWeekly && "mr-[25px]")}
          style={{
            color: isBlackRange(hexToRgba(roleColor || "", 1))
              ? "#FFF"
              : "#000",
          }}
        >
          {targetHPPDValue === "" ? "-" : targetHPPDValue}
        </div>
      )}

      {!isEdit && !disabled && (
        <div className="absolute right-[-5px]">
          <Tooltip content="Edit Target HPPD for This Day">
            <EditIcon
              className="cursor-pointer"
              width="16px"
              height="16px"
              color="#3FBD6B"
              onClick={() => {
                setIsEdit(true);
              }}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default TargetHPPD;
