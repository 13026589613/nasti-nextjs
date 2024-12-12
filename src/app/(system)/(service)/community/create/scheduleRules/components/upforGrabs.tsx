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

export interface UpforGrabsProps {
  form: UseFormReturn<ScheduleRulesFormValues>;
  field: ControllerRenderProps<ScheduleRulesFormValues, "ufgRule">;
  ruleCode: CommunityRuleCodeListResponse;
  isDisabled: boolean;
}
const UpforGrabs = (props: UpforGrabsProps) => {
  const { form, field, ruleCode, isDisabled } = props;
  const { onChange } = field;
  const ufgRule = form.watch("ufgRule");
  return (
    <div className="mb-[52px]">
      <div className="flex items-center gap-2 text-[16] leading-10 text-[#324664] font-[420]">
        <FileIcon width="16" height="16" className="" />
        <div>Up for Grabs Rules</div>
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
                    {`Up for Grabs shifts are shifts for which a team member is
                    assigned but can't work. You can allow them to post the
                    shift as "Up for Grabs" which will allow other qualified
                    team members to claim the shift, based on the overtime rules
                    you have already established.`}
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
            className={cn(ufgRule !== "NO_COVERAGE" && "border-[#E2E8F0]")}
            onClick={() => {
              if (!isDisabled) {
                form.setValue("ufgAllowHrs", "4");
                form.setValue("ufgAllowHrs2", "4");

                onChange({
                  target: { value: "NO_COVERAGE" },
                });
                form.clearErrors("ufgAllowHrs");
                form.clearErrors("ufgAllowHrs2");
              }
            }}
            value="NO_COVERAGE"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                form.setValue("ufgAllowHrs", "4");
                form.setValue("ufgAllowHrs2", "4");

                onChange({
                  target: { value: "NO_COVERAGE" },
                });
                form.clearErrors("ufgAllowHrs");
                form.clearErrors("ufgAllowHrs2");
              }
            }}
          >
            {getLabel("NO_COVERAGE", ruleCode)}
          </Label>
        </div>
        <div className="flex space-x-2 min-h-10">
          <RadioGroupItem
            className={cn(
              "mt-3",
              ufgRule !== "APPROVE_COVERAGE" && "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                if (ufgRule !== "APPROVE_COVERAGE") {
                  form.setValue("ufgAllowHrs", "4");
                }
                form.setValue("ufgAllowHrs2", "4");

                onChange({
                  target: { value: "APPROVE_COVERAGE" },
                });

                form.clearErrors("ufgAllowHrs2");
              }
            }}
            value="APPROVE_COVERAGE"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                if (ufgRule !== "APPROVE_COVERAGE") {
                  form.setValue("ufgAllowHrs", "4");
                }
                form.setValue("ufgAllowHrs2", "4");

                onChange({
                  target: { value: "APPROVE_COVERAGE" },
                });

                form.clearErrors("ufgAllowHrs2");
              }
            }}
          >
            <div>
              <span className="leading-10">
                {getLabel("APPROVE_COVERAGE", ruleCode)?.split("$s")[0]}
              </span>
              <div className="inline-flex items-center">
                <FormField
                  control={form.control}
                  name="ufgAllowHrs"
                  render={({ field, fieldState }) => {
                    const { error } = fieldState;

                    return (
                      <Input
                        disabled={isDisabled || ufgRule !== "APPROVE_COVERAGE"}
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
                {getLabel("APPROVE_COVERAGE", ruleCode)?.split("$s")[1]}
              </span>
            </div>
          </Label>
        </div>

        <div className="flex space-x-2 min-h-10">
          <RadioGroupItem
            className={cn(
              "mt-3",
              ufgRule !== "AUTO_COVERAGE" && "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                if (ufgRule !== "AUTO_COVERAGE") {
                  form.setValue("ufgAllowHrs2", "4");
                }
                form.setValue("ufgAllowHrs", "4");
                onChange({
                  target: { value: "AUTO_COVERAGE" },
                });

                form.clearErrors("ufgAllowHrs");
              }
            }}
            value="AUTO_COVERAGE"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                if (ufgRule !== "AUTO_COVERAGE") {
                  form.setValue("ufgAllowHrs2", "4");
                }
                form.setValue("ufgAllowHrs", "4");
                onChange({
                  target: { value: "AUTO_COVERAGE" },
                });

                form.clearErrors("ufgAllowHrs");
              }
            }}
          >
            <div>
              <span className="leading-10">
                {getLabel("AUTO_COVERAGE", ruleCode)?.split("$s")[0]}
              </span>
              <div className="inline-flex items-center">
                <FormField
                  control={form.control}
                  name="ufgAllowHrs2"
                  render={({ field, fieldState }) => {
                    const { error } = fieldState;

                    return (
                      <Input
                        disabled={isDisabled || ufgRule !== "AUTO_COVERAGE"}
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
                {getLabel("AUTO_COVERAGE", ruleCode)?.split("$s")[1]}
              </span>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
export default UpforGrabs;
