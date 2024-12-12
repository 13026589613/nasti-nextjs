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

export interface SwapRulesProps {
  form: UseFormReturn<ScheduleRulesFormValues>;
  field: ControllerRenderProps<ScheduleRulesFormValues, "swapRule">;
  ruleCode: CommunityRuleCodeListResponse;
  isDisabled: boolean;
}
const SwapRules = (props: SwapRulesProps) => {
  const { form, field, ruleCode, isDisabled } = props;
  const { onChange } = field;
  const swapRule = form.watch("swapRule");
  return (
    <div className="mb-[52px]">
      <div className="flex items-center gap-2 text-[16] leading-10 text-[#324664] font-[420]">
        <FileIcon width="16" height="16" className="" />
        <div className="relative">
          Swap Rules
          <div className="absolute right-[-25px] top-[2px]">
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
                  <div className="relative text-wrap max-w-[300px]">
                    {`Swapping allows employees to find a replacement for a shift
                    for which they cannot work. In order to swap a shift, the
                    employee must identify another employee's shift that matches
                    department and role and duration. It must occur within the
                    same week and not violate community overtime rules.`}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <RadioGroup disabled={isDisabled} {...field}>
        <div className="flex items-center space-x-2 h-10">
          <RadioGroupItem
            className={cn(swapRule !== "NO_SHIFT_SWAPS" && "border-[#E2E8F0]")}
            onClick={() => {
              if (!isDisabled) {
                form.setValue("swapAllowHrs", "4");
                form.setValue("swapAllowHrs2", "4");

                onChange({
                  target: { value: "NO_SHIFT_SWAPS" },
                });
                form.clearErrors("swapAllowHrs");
                form.clearErrors("swapAllowHrs2");
              }
            }}
            value="NO_SHIFT_SWAPS"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                form.setValue("swapAllowHrs", "4");
                form.setValue("swapAllowHrs2", "4");

                onChange({
                  target: { value: "NO_SHIFT_SWAPS" },
                });
                form.clearErrors("swapAllowHrs");
                form.clearErrors("swapAllowHrs2");
              }
            }}
          >
            {getLabel("NO_SHIFT_SWAPS", ruleCode)}
          </Label>
        </div>
        <div className="flex items-start space-x-2 min-h-10">
          <RadioGroupItem
            className={cn(
              "mt-3",
              swapRule !== "SCHEDULER_APPROVE_SWAPS" && "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                if (swapRule !== "SCHEDULER_APPROVE_SWAPS") {
                  form.setValue("swapAllowHrs", "4");
                }
                form.setValue("swapAllowHrs2", "4");
                onChange({
                  target: { value: "SCHEDULER_APPROVE_SWAPS" },
                });
                form.clearErrors("swapAllowHrs2");
              }
            }}
            value="SCHEDULER_APPROVE_SWAPS"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                if (swapRule !== "SCHEDULER_APPROVE_SWAPS") {
                  form.setValue("swapAllowHrs", "4");
                }
                form.setValue("swapAllowHrs2", "4");
                onChange({
                  target: { value: "SCHEDULER_APPROVE_SWAPS" },
                });
                form.clearErrors("swapAllowHrs2");
              }
            }}
          >
            <div>
              <span className="leading-10">
                {getLabel("SCHEDULER_APPROVE_SWAPS", ruleCode)?.split("$s")[0]}
              </span>
              <div className="inline-flex items-center">
                <FormField
                  control={form.control}
                  name="swapAllowHrs"
                  render={({ field, fieldState }) => {
                    const { error } = fieldState;

                    return (
                      <Input
                        disabled={
                          isDisabled || swapRule !== "SCHEDULER_APPROVE_SWAPS"
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
                {getLabel("SCHEDULER_APPROVE_SWAPS", ruleCode)?.split("$s")[1]}
              </span>
            </div>
          </Label>
        </div>

        <div className="flex items-start space-x-2 min-h-10">
          <RadioGroupItem
            className={cn(
              "mt-3",
              swapRule !== "AUTO_APPROVE_SWAPS" && "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                if (swapRule !== "AUTO_APPROVE_SWAPS") {
                  form.setValue("swapAllowHrs2", "4");
                }
                form.setValue("swapAllowHrs", "4");

                onChange({
                  target: { value: "AUTO_APPROVE_SWAPS" },
                });
                form.clearErrors("swapAllowHrs");
              }
            }}
            value="AUTO_APPROVE_SWAPS"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                if (swapRule !== "AUTO_APPROVE_SWAPS") {
                  form.setValue("swapAllowHrs2", "4");
                }
                form.setValue("swapAllowHrs", "4");
                onChange({
                  target: { value: "AUTO_APPROVE_SWAPS" },
                });
                form.clearErrors("swapAllowHrs");
              }
            }}
          >
            <div>
              <span className="leading-10">
                {getLabel("AUTO_APPROVE_SWAPS", ruleCode)?.split("$s")[0]}
              </span>
              <div className="inline-flex items-center">
                <FormField
                  control={form.control}
                  name="swapAllowHrs2"
                  render={({ field, fieldState }) => {
                    const { error } = fieldState;

                    return (
                      <Input
                        disabled={
                          isDisabled || swapRule !== "AUTO_APPROVE_SWAPS"
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
                {getLabel("AUTO_APPROVE_SWAPS", ruleCode)?.split("$s")[1]}
              </span>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
export default SwapRules;
