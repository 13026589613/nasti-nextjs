import { useEffect } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";

import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getLabel } from "@/utils/scheduleRule";
import FileIcon from "~/icons/FileIcon.svg";
import QuestionIcon from "~/icons/QuestionIcon.svg";

import { ScheduleRulesFormValues } from "../hooks/useFormHook";
import { CommunityRuleCodeListResponse } from "../types";

export interface CallOffProps {
  form: UseFormReturn<ScheduleRulesFormValues>;
  field: ControllerRenderProps<ScheduleRulesFormValues, "calloffRule">;
  ruleCode: CommunityRuleCodeListResponse;
  isDisabled: boolean;
}
const CallOff = (props: CallOffProps) => {
  const { form, field, ruleCode, isDisabled } = props;
  const { onChange } = field;
  const calloffRule = form.watch("calloffRule");

  useEffect(() => {
    if (calloffRule !== "ALLOW_CALL_OFF_WITHIN_HOURS") {
      form.setValue("calloffRuleInner", {
        calloffAllowHrs: "",
      });

      form.setValue("calloffRuleInner", null);
    } else {
      form.setValue("calloffRuleInner", {
        calloffAllowHrs: "",
      });
    }
  }, [calloffRule]);

  return (
    <div className="mb-[52px]">
      <div className="flex items-center gap-2 text-[16] leading-10 text-[#324664] font-[420]">
        <FileIcon width="16" height="16" className="" />
        <div>Call off Rules</div>
        <div className="right-[-25px] top-[2px]">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger
                type="button"
                onClick={(e: any) => {
                  e.stopPropagation();
                }}
              >
                <QuestionIcon color="var(--primary-color)" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="w-[330px]">
                  <p>
                    Regardless of your selection here, all call offs will need
                    to be reviewed and approved by the scheduler. The first
                    option prevents them from having the option of requesting a
                    call off. The second option allows a request of a call off
                    based on the time rules that you establish.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <RadioGroup disabled={isDisabled} {...field}>
        <div className="flex items-center space-x-2 h-10">
          <RadioGroupItem
            className={cn(calloffRule !== "NO_CALL_OFF" && "border-[#E2E8F0]")}
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "NO_CALL_OFF" },
                });
                form.clearErrors("calloffRuleInner.calloffAllowHrs");
              }
            }}
            value="NO_CALL_OFF"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "NO_CALL_OFF" },
                });
                form.clearErrors("calloffRuleInner.calloffAllowHrs");
              }
            }}
          >
            {getLabel("NO_CALL_OFF", ruleCode)}
          </Label>
        </div>
        <div className="flex items-center space-x-2 h-10">
          <RadioGroupItem
            className={cn(
              calloffRule !== "ALLOW_CALL_OFF_WITHIN_HOURS" &&
                "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "ALLOW_CALL_OFF_WITHIN_HOURS" },
                });
              }
            }}
            value="ALLOW_CALL_OFF_WITHIN_HOURS"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "ALLOW_CALL_OFF_WITHIN_HOURS" },
                });
              }
            }}
          >
            <div>
              <span className="leading-10">
                {
                  getLabel("ALLOW_CALL_OFF_WITHIN_HOURS", ruleCode)?.split(
                    "$s"
                  )[0]
                }
              </span>
              <div className="inline-flex items-center">
                <FormField
                  control={form.control}
                  name="calloffRuleInner.calloffAllowHrs"
                  render={({ field, fieldState }) => {
                    const { error } = fieldState;

                    return (
                      <Input
                        disabled={
                          isDisabled ||
                          calloffRule !== "ALLOW_CALL_OFF_WITHIN_HOURS"
                        }
                        className={cn(
                          !error ? "border-[#E2E8F0]" : "border-[#FF4D4F]"
                        )}
                        placeholder="Enter Number"
                        {...field}
                        onChange={(e) => {
                          e.stopPropagation();
                          const value = e.target.value;
                          if (!isNaN(Number(value)) && Number(value) >= 0) {
                            field.onChange(e);
                          }
                        }}
                      />
                    );
                  }}
                />
              </div>

              <span className="leading-10">
                {
                  getLabel("ALLOW_CALL_OFF_WITHIN_HOURS", ruleCode)?.split(
                    "$s"
                  )[1]
                }
              </span>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
export default CallOff;
