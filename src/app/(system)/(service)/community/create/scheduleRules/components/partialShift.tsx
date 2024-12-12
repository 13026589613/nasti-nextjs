import { useEffect } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";

import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
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

export interface PartialShiftProps {
  form: UseFormReturn<ScheduleRulesFormValues>;
  field: ControllerRenderProps<ScheduleRulesFormValues, "partialShiftRule">;
  ruleCode: CommunityRuleCodeListResponse;
  isDisabled: boolean;
}
const PartialShift = (props: PartialShiftProps) => {
  const { form, field, ruleCode, isDisabled } = props;
  const { onChange } = field;
  const partialShiftRule = form.watch("partialShiftRule");
  const partialShiftAutoApprove = form.watch(
    "partialShiftInner.partialShiftAutoApprove"
  );

  useEffect(() => {
    if (partialShiftRule === "NO_PARTIAL_SHIFTS") {
      form.setValue("partialShiftInner", null);
    } else if (partialShiftRule === "ALLOW_PARTIAL_SHIFTS") {
      form.setValue("partialShiftInner", {
        partialShiftMinHrs: "",
        partialShiftAutoApprove: false,
        partialShiftInnerNext: null,
      });
    }
  }, [partialShiftRule, form]);

  useEffect(() => {
    if (partialShiftRule === "ALLOW_PARTIAL_SHIFTS") {
      if (!partialShiftAutoApprove) {
        form.setValue("partialShiftInner.partialShiftInnerNext", null);
      } else {
        form.setValue("partialShiftInner.partialShiftInnerNext", {
          partialShiftRemainingMinHrs: "",
        });
      }
    }
  }, [partialShiftAutoApprove, partialShiftRule]);
  return (
    <div className="mb-[52px]">
      <div className="flex items-center gap-2 text-[16] leading-10 text-[#324664] font-[420]">
        <FileIcon width="16" height="16" className="" />
        <div className="relative">
          Partial Shift Rules
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
                  <div className="w-[400px]">
                    <p>
                      1. A partial shift is when an employee cannot work their
                      scheduled time. They can propose to work only a partial
                      amount of the shift.
                    </p>
                    <p>
                      2. If the proposed worked time is approved, you can choose
                      to automatically post a new shift for the remaining time
                      of the shift if the remaining time equals or exceeds the
                      minimum hours to repost entered below. If the remaining
                      time does not equal or exceed the minimum hours entered
                      below, NASTi will not automatically post an open shift to
                      cover the remaining time of the shift.
                    </p>
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
            className={cn(
              partialShiftRule !== "NO_PARTIAL_SHIFTS" && "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "NO_PARTIAL_SHIFTS" },
                });
                form.clearErrors("partialShiftInner.partialShiftMinHrs");
                form.clearErrors(
                  "partialShiftInner.partialShiftInnerNext.partialShiftRemainingMinHrs"
                );
              }
            }}
            value="NO_PARTIAL_SHIFTS"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "NO_PARTIAL_SHIFTS" },
                });
                form.clearErrors("partialShiftInner.partialShiftMinHrs");
                form.clearErrors(
                  "partialShiftInner.partialShiftInnerNext.partialShiftRemainingMinHrs"
                );
              }
            }}
          >
            {getLabel("NO_PARTIAL_SHIFTS", ruleCode)}
          </Label>
        </div>
        <div className="flex items-center space-x-2 h-10">
          <RadioGroupItem
            className={cn(
              partialShiftRule !== "ALLOW_PARTIAL_SHIFTS" && "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "ALLOW_PARTIAL_SHIFTS" },
                });
              }
            }}
            value="ALLOW_PARTIAL_SHIFTS"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                onChange({
                  target: { value: "ALLOW_PARTIAL_SHIFTS" },
                });
              }
            }}
          >
            {getLabel("ALLOW_PARTIAL_SHIFTS", ruleCode)}
          </Label>
        </div>
      </RadioGroup>
      {partialShiftRule === "ALLOW_PARTIAL_SHIFTS" && (
        <div className="w-full px-6 py-[14px] border border-[#E7EDF1]">
          <div className="w-full min-h-10 mb-[10px] text-[#919FB4] text-[16px] font-[390]">
            <div className="inline-block w-[200px] mr-4">
              <FormField
                control={form.control}
                name="partialShiftInner.partialShiftMinHrs"
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
            <span className=" leading-10">
              minimum hours allowed to be proposed to be worked by employees to
              qualify for a partial shift.
            </span>
          </div>

          <FormField
            control={form.control}
            name="partialShiftInner.partialShiftAutoApprove"
            render={({ field, formState }) => {
              return (
                <div className="flex items-center gap-[15px] w-full h-10 mb-[10px]">
                  <div className={cn("leading-10 font-[390] text-[16px]")}>
                    Automatically approve partial shifts.
                  </div>
                  <Switch
                    disabled={isDisabled}
                    name={field.name}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    checked={field.value}
                    onCheckedChange={(data) => {
                      field.onChange(data);
                      form.clearErrors(
                        "partialShiftInner.partialShiftInnerNext.partialShiftRemainingMinHrs"
                      );
                    }}
                  />
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
                          <div className="w-[400px]">
                            <p className="font-medium">
                              If partial shifts are not automatically approved,
                              then a scheduler will receive a notification
                              through NASTi asking them to manually approve the
                              partial shift.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            }}
          />
          {partialShiftAutoApprove && (
            <div className="w-full min-h-10 text-[#919FB4] text-[16px] font-[390]">
              <div className="inline-block w-[200px] mr-4">
                <FormField
                  control={form.control}
                  name="partialShiftInner.partialShiftInnerNext.partialShiftRemainingMinHrs"
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
                minimum number of hours remaining from the original shift needed
                to automatically create another open shift.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default PartialShift;
