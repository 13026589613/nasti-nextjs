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

export interface OpenShiftProps {
  form: UseFormReturn<ScheduleRulesFormValues>;
  field: ControllerRenderProps<ScheduleRulesFormValues, "openShiftRule">;
  ruleCode: CommunityRuleCodeListResponse;
  isDisabled: boolean;
}
const OpenShift = (props: OpenShiftProps) => {
  const { form, field, ruleCode, isDisabled } = props;
  const { onChange } = field;
  const openShiftRule = form.watch("openShiftRule");

  return (
    <div className="mb-[52px]">
      <div className="flex items-center gap-2 text-[16] leading-10 text-[#324664] font-[420]">
        <FileIcon width="16" height="16" className="" />
        <div>Open Shift Rules</div>
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
                <div className="w-[380px]">
                  <p>
                    Open Shift rules apply to shifts that are not initially
                    assigned to any team member but can be claimed by qualified
                    team members after a schedule is published to all employees.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <RadioGroup {...field}>
        <div className="flex space-x-2">
          <RadioGroupItem
            disabled={isDisabled}
            className={cn(
              "mt-[12px]",
              openShiftRule !== "AUTO_APPROVE_QUALIFIED_SHIFT" &&
                "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                form.setValue("openShiftClaimMinsApprove", "0");
                onChange({
                  target: { value: "AUTO_APPROVE_QUALIFIED_SHIFT" },
                });

                form.clearErrors("openShiftClaimMinsApprove");
              }
            }}
            value="AUTO_APPROVE_QUALIFIED_SHIFT"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                form.setValue("openShiftClaimMinsApprove", "0");
                onChange({
                  target: { value: "AUTO_APPROVE_QUALIFIED_SHIFT" },
                });
                form.clearErrors("openShiftClaimMinsApprove");
              }
            }}
          >
            <div>
              <span className="leading-10">
                {
                  getLabel("AUTO_APPROVE_QUALIFIED_SHIFT", ruleCode)?.split(
                    "$s"
                  )[0]
                }
              </span>
              <div className="inline-flex items-center">
                <FormField
                  control={form.control}
                  name="openShiftClaimMinsAuto"
                  render={({ field, fieldState }) => {
                    const { error } = fieldState;

                    return (
                      <Input
                        disabled={
                          isDisabled ||
                          openShiftRule !== "AUTO_APPROVE_QUALIFIED_SHIFT"
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
              <span>
                {
                  getLabel("AUTO_APPROVE_QUALIFIED_SHIFT", ruleCode)?.split(
                    "$s"
                  )[1]
                }
              </span>
            </div>
          </Label>
        </div>
        <div className="flex space-x-2">
          <RadioGroupItem
            disabled={isDisabled}
            className={cn(
              "mt-[12px]",
              openShiftRule !== "SCHEDULER_APPROVE_ALL_CLAIMED_SHIFTS" &&
                "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                form.setValue("openShiftClaimMinsAuto", "0");
                onChange({
                  target: { value: "SCHEDULER_APPROVE_ALL_CLAIMED_SHIFTS" },
                });
                form.clearErrors("openShiftClaimMinsAuto");
              }
            }}
            value="SCHEDULER_APPROVE_ALL_CLAIMED_SHIFTS"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                form.setValue("openShiftClaimMinsAuto", "0");
                onChange({
                  target: { value: "SCHEDULER_APPROVE_ALL_CLAIMED_SHIFTS" },
                });
                form.clearErrors("openShiftClaimMinsAuto");
              }
            }}
          >
            <div>
              <span className="leading-10">
                {
                  getLabel(
                    "SCHEDULER_APPROVE_ALL_CLAIMED_SHIFTS",
                    ruleCode
                  )?.split("$s")[0]
                }
              </span>
              <div className="inline-flex items-center">
                <FormField
                  control={form.control}
                  name="openShiftClaimMinsApprove"
                  render={({ field, fieldState }) => {
                    const { error } = fieldState;

                    return (
                      <Input
                        disabled={
                          isDisabled ||
                          openShiftRule !==
                            "SCHEDULER_APPROVE_ALL_CLAIMED_SHIFTS"
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
                  getLabel(
                    "SCHEDULER_APPROVE_ALL_CLAIMED_SHIFTS",
                    ruleCode
                  )?.split("$s")[1]
                }
              </span>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
export default OpenShift;
