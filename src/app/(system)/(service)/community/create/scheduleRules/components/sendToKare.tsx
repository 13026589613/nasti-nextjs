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
export interface SendToKareProps {
  form: UseFormReturn<ScheduleRulesFormValues>;
  field: ControllerRenderProps<ScheduleRulesFormValues, "sendToKareRule">;
  ruleCode: CommunityRuleCodeListResponse;
  isDisabled: boolean;
}
const SendToKare = (props: SendToKareProps) => {
  const { form, field, ruleCode, isDisabled } = props;
  const { onChange } = field;
  const sendToKareRule = form.watch("sendToKareRule");

  const sendKareManuallyNotification = form.watch(
    "sendToKareStartDayInnerNext.sendKareManuallyNotification"
  );

  return (
    <div className="mb-[52px]">
      <div className="flex items-center gap-2 text-[16] leading-10 text-[#324664] font-[420]">
        <FileIcon width="16" height="16" className="" />
        <div>Send to KARE Rules</div>
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
                  <p>
                    With NASTi, you have the ability to send certain open shifts
                    to the KARE HERO marketplace. If a HERO applies to work one
                    of your open shifts you will see all of the necessary
                    information in NASTi. For more information about the KARE
                    Marketplace go to www.doyoukare.com.
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
            className={cn(
              sendToKareRule !== "SCHEDULE_PUBLISHED" && "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                form.setValue("sendToKareStartDayInnerNext", null);
                form.setValue("sendToKareStartDayInner", {
                  sendToKareStartDay: "4",
                });
                form.setValue("sendToKareStartDayInner", null);

                onChange({
                  target: { value: "SCHEDULE_PUBLISHED" },
                });
                form.clearErrors("sendToKareStartDayInner.sendToKareStartDay");
                form.clearErrors(
                  "sendToKareStartDayInnerNext.sendKareManuallyNotificationInner.sendKareManuallyNotificationDay"
                );
              }
            }}
            value="SCHEDULE_PUBLISHED"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                form.setValue("sendToKareStartDayInner", {
                  sendToKareStartDay: "4",
                });
                form.setValue("sendToKareStartDayInner", null);

                form.setValue("sendToKareStartDayInnerNext", null);
                onChange({
                  target: { value: "SCHEDULE_PUBLISHED" },
                });
                form.clearErrors("sendToKareStartDayInner.sendToKareStartDay");
                form.clearErrors(
                  "sendToKareStartDayInnerNext.sendKareManuallyNotificationInner.sendKareManuallyNotificationDay"
                );
              }
            }}
          >
            {getLabel("SCHEDULE_PUBLISHED", ruleCode)}
          </Label>
        </div>
        <div className="flex items-center space-x-2 h-10">
          <RadioGroupItem
            className={cn(
              sendToKareRule !== "SHIFT_OPEN_START_DAY" && "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                if (sendToKareRule !== "SHIFT_OPEN_START_DAY") {
                  form.setValue(
                    "sendToKareStartDayInner.sendToKareStartDay",
                    "4"
                  );
                }

                form.setValue("sendToKareStartDayInnerNext", null);
                onChange({
                  target: { value: "SHIFT_OPEN_START_DAY" },
                });
                form.clearErrors(
                  "sendToKareStartDayInnerNext.sendKareManuallyNotificationInner.sendKareManuallyNotificationDay"
                );
              }
            }}
            value="SHIFT_OPEN_START_DAY"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                if (sendToKareRule !== "SHIFT_OPEN_START_DAY") {
                  form.setValue(
                    "sendToKareStartDayInner.sendToKareStartDay",
                    "4"
                  );
                }

                form.setValue("sendToKareStartDayInnerNext", null);
                onChange({
                  target: { value: "SHIFT_OPEN_START_DAY" },
                });
                form.clearErrors(
                  "sendToKareStartDayInnerNext.sendKareManuallyNotificationInner.sendKareManuallyNotificationDay"
                );
              }
            }}
          >
            <div>
              <span className="leading-10">
                {getLabel("SHIFT_OPEN_START_DAY", ruleCode)?.split("$s")[0]}
              </span>
              <div className="inline-flex items-center">
                <FormField
                  control={form.control}
                  name="sendToKareStartDayInner.sendToKareStartDay"
                  render={({ field, fieldState }) => {
                    const { error } = fieldState;

                    return (
                      <Input
                        disabled={
                          isDisabled ||
                          sendToKareRule !== "SHIFT_OPEN_START_DAY"
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
                {getLabel("SHIFT_OPEN_START_DAY", ruleCode)?.split("$s")[1]}
              </span>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2 h-10">
          <RadioGroupItem
            className={cn(
              sendToKareRule !== "MANUALLY_SHIFT_TO_KARE" && "border-[#E2E8F0]"
            )}
            onClick={() => {
              if (!isDisabled) {
                if (sendToKareRule !== "MANUALLY_SHIFT_TO_KARE") {
                  form.setValue("sendToKareStartDayInnerNext", {
                    sendKareManuallyNotification: false,
                    sendKareManuallyNotificationInner: null,
                  });
                }
                form.setValue("sendToKareStartDayInner", {
                  sendToKareStartDay: "4",
                });

                form.setValue("sendToKareStartDayInner", null);
                onChange({
                  target: { value: "MANUALLY_SHIFT_TO_KARE" },
                });
                form.clearErrors("sendToKareStartDayInner.sendToKareStartDay");
              }
            }}
            value="MANUALLY_SHIFT_TO_KARE"
          />
          <Label
            className="text-[#919FB4] text-[16px] font-[390]"
            onClick={() => {
              if (!isDisabled) {
                if (sendToKareRule !== "MANUALLY_SHIFT_TO_KARE") {
                  form.setValue("sendToKareStartDayInnerNext", {
                    sendKareManuallyNotification: false,
                    sendKareManuallyNotificationInner: {
                      sendKareManuallyNotificationDay: "4",
                    },
                  });
                }
                form.setValue("sendToKareStartDayInner", {
                  sendToKareStartDay: "4",
                });
                form.setValue("sendToKareStartDayInner", null);
                onChange({
                  target: { value: "MANUALLY_SHIFT_TO_KARE" },
                });
                form.clearErrors("sendToKareStartDayInner.sendToKareStartDay");
              }
            }}
          >
            {getLabel("MANUALLY_SHIFT_TO_KARE", ruleCode)}
          </Label>
        </div>
        {sendToKareRule === "MANUALLY_SHIFT_TO_KARE" && (
          <>
            <FormField
              control={form.control}
              name="sendToKareStartDayInnerNext.sendKareManuallyNotification"
              render={({ field, formState }) => {
                return (
                  <div className="flex items-center gap-[15px] w-full h-10 mb-[10px]">
                    <div
                      className={cn(
                        "leading-10 text-[#919FB4] text-[16px] font-[390] pl-[24px]"
                      )}
                    >
                      <div>
                        <span className="leading-10">
                          Remind me through a notification to send to KARE when
                          the open shift start date is{" "}
                        </span>
                        <div className="inline-flex items-center">
                          <FormField
                            control={form.control}
                            name="sendToKareStartDayInnerNext.sendKareManuallyNotificationInner.sendKareManuallyNotificationDay"
                            render={({ field, fieldState }) => {
                              const { error } = fieldState;

                              return (
                                <Input
                                  disabled={
                                    isDisabled || !sendKareManuallyNotification
                                  }
                                  className={cn(
                                    !error
                                      ? "border-[#E2E8F0]"
                                      : "border-[#FF4D4F]"
                                  )}
                                  placeholder="Enter Number"
                                  {...field}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const value = e.target.value;
                                    if (
                                      !isNaN(Number(value)) &&
                                      Number(value) >= 0
                                    ) {
                                      field.onChange(e);
                                    }
                                  }}
                                />
                              );
                            }}
                          />
                        </div>

                        <span className="leading-10"> days away.</span>
                      </div>
                    </div>
                    <Switch
                      disabled={isDisabled}
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      checked={field.value}
                      onCheckedChange={(data) => {
                        form.setValue(
                          "sendToKareStartDayInnerNext.sendKareManuallyNotificationInner.sendKareManuallyNotificationDay",
                          "4"
                        );
                        field.onChange(data);
                      }}
                    />
                  </div>
                );
              }}
            />
          </>
        )}
      </RadioGroup>
    </div>
  );
};
export default SendToKare;
