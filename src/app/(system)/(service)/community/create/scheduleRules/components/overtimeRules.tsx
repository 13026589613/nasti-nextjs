import { useEffect } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";

import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { getLabel } from "@/utils/scheduleRule";
import FileIcon from "~/icons/FileIcon.svg";

import { ScheduleRulesFormValues } from "../hooks/useFormHook";
import { CommunityRuleCodeListResponse } from "../types";

export interface OvertimeRulesProps {
  form: UseFormReturn<ScheduleRulesFormValues>;
  field: ControllerRenderProps<ScheduleRulesFormValues, "overtimeRule">;
  ruleCode: CommunityRuleCodeListResponse;
  isDisabled: boolean;
}
const OvertimeRules = (props: OvertimeRulesProps) => {
  const { form, field, ruleCode, isDisabled } = props;
  const { onChange } = field;
  const overtimeRule = form.watch("overtimeRule");

  useEffect(() => {
    if (overtimeRule !== "OT_LIMITED") {
      form.setValue("overtimeRulesInner", null);
      if (overtimeRule !== "OT_NOTIFICATION_REQUIRED") {
        form.setValue("overtimeRulesInnerNext", null);
      } else {
        form.setValue("overtimeRulesInnerNext", {
          overtimeEmployeeHrs: "",
          overtimeCommunityHrs: "",
        });
      }
    } else {
      form.setValue("overtimeRulesInner", {
        overtimeMessageHrs: "",
      });
    }
  }, [form, overtimeRule]);

  return (
    <div className="mb-[52px]">
      <div className="flex items-center gap-2 text-[16] leading-10 text-[#324664] font-[420]">
        <FileIcon width="16" height="16" className="" />
        <div>Overtime Rules</div>
      </div>
      <RadioGroup {...field}>
        <div className="flex items-center space-x-2 min-h-10">
          <RadioGroupItem
            disabled={isDisabled}
            className={cn(overtimeRule !== "NO_OVERTIME" && "border-[#E2E8F0]")}
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "NO_OVERTIME" },
                });
              }
            }}
            value="NO_OVERTIME"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "NO_OVERTIME" },
                });
              }
            }}
          >
            {getLabel("NO_OVERTIME", ruleCode)}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            disabled={isDisabled}
            className={cn(overtimeRule !== "OT_LIMITED" && "border-[#E2E8F0]")}
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "OT_LIMITED" },
                });
              }
            }}
            value="OT_LIMITED"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "OT_LIMITED" },
                });
              }
            }}
          >
            {getLabel("OT_LIMITED", ruleCode)}
          </Label>
        </div>
        {overtimeRule === "OT_LIMITED" && (
          <div className="flex items-center flex-wrap gap-[15px] w-full ml-6 min-h-10 text-[#919FB4] text-[16px] font-[390]">
            <span>(Optional) More than</span>
            <FormField
              control={form.control}
              name="overtimeRulesInner.overtimeMessageHrs"
              render={({ field, fieldState }) => {
                const { error } = fieldState;

                return (
                  <Input
                    disabled={isDisabled}
                    className={cn(
                      !error ? "border-[#E2E8F0]" : "border-[#FF4D4F]"
                    )}
                    placeholder="Enter Number"
                    {...field}
                    value={field.value || ""}
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
            <span>
              hours of overtime per week for an employee will trigger a message
              to the scheduler.
            </span>
          </div>
        )}
        <div className="flex items-center space-x-2 h-10">
          <RadioGroupItem
            disabled={isDisabled}
            className={cn(
              overtimeRule !== "OT_APPROVAL_REQUIRED" && "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "OT_APPROVAL_REQUIRED" },
                });
              }
            }}
            value="OT_APPROVAL_REQUIRED"
            id="r2"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "OT_APPROVAL_REQUIRED" },
                });
              }
            }}
          >
            {getLabel("OT_APPROVAL_REQUIRED", ruleCode)}
          </Label>
        </div>
        <div className="flex space-x-2 h-10">
          <RadioGroupItem
            disabled={isDisabled}
            className={cn(
              "mt-1",
              overtimeRule !== "OT_NOTIFICATION_REQUIRED" && "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "OT_NOTIFICATION_REQUIRED" },
                });
              }
            }}
            value="OT_NOTIFICATION_REQUIRED"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "OT_NOTIFICATION_REQUIRED" },
                });
              }
            }}
          >
            {getLabel("OT_NOTIFICATION_REQUIRED", ruleCode)}
          </Label>
        </div>
        {overtimeRule === "OT_NOTIFICATION_REQUIRED" && (
          <>
            <div className="flex items-center gap-[15px] w-full ml-6 h-10 text-[#919FB4] text-[16px] font-[390]">
              <FormField
                control={form.control}
                name="overtimeRulesInnerNext.overtimeEmployeeHrs"
                render={({ field, fieldState }) => {
                  const { error } = fieldState;

                  return (
                    <Input
                      disabled={isDisabled}
                      className={cn(
                        !error ? "border-[#E2E8F0]" : "border-[#FF4D4F]"
                      )}
                      placeholder="Enter Number"
                      {...field}
                      onBlur={(e) => {
                        e.stopPropagation();
                        const value = e.target.value;
                        if (!isNaN(Number(value)) && value !== "") {
                          if (Number(value) <= 0) {
                            toast.warning("Value must be greater than 0.");
                            field.onChange({
                              target: { value: "" },
                            });
                          }
                        }
                      }}
                      onChange={(e) => {
                        e.stopPropagation();
                        const value = e.target.value;
                        if (!isNaN(Number(value)) && Number(value) >= 0) {
                          field.onChange(e);
                          form.clearErrors(
                            "overtimeRulesInnerNext.overtimeEmployeeHrs"
                          );
                          form.clearErrors(
                            "overtimeRulesInnerNext.overtimeCommunityHrs"
                          );
                        }
                      }}
                    />
                  );
                }}
              />
              <span>hours overtime per week per employee</span>
            </div>
            <div className="flex items-center gap-[15px] w-full ml-6 h-10 text-[#919FB4] text-[16px] font-[390]">
              <FormField
                control={form.control}
                name="overtimeRulesInnerNext.overtimeCommunityHrs"
                render={({ field, fieldState }) => {
                  const { error } = fieldState;
                  return (
                    <Input
                      disabled={isDisabled}
                      className={cn(
                        !error ? "border-[#E2E8F0]" : "border-[#FF4D4F]"
                      )}
                      placeholder="Enter Number"
                      {...field}
                      onBlur={(e) => {
                        e.stopPropagation();
                        const value = e.target.value;
                        if (!isNaN(Number(value)) && value !== "") {
                          if (Number(value) <= 0) {
                            toast.warning("Value must be greater than 0.");
                            field.onChange({
                              target: { value: "" },
                            });
                          }
                        }
                      }}
                      onChange={(e) => {
                        e.stopPropagation();
                        const value = e.target.value;
                        if (!isNaN(Number(value)) && Number(value) >= 0) {
                          field.onChange(e);
                          form.clearErrors(
                            "overtimeRulesInnerNext.overtimeEmployeeHrs"
                          );
                          form.clearErrors(
                            "overtimeRulesInnerNext.overtimeCommunityHrs"
                          );
                        }
                      }}
                    />
                  );
                }}
              />
              <span>community overtime hours per week</span>
            </div>
          </>
        )}
      </RadioGroup>
    </div>
  );
};
export default OvertimeRules;
