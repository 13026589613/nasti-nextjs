import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import FileIcon from "~/icons/FileIcon.svg";
import QuestionIcon from "~/icons/QuestionIcon.svg";

import { ScheduleRulesFormValues } from "../hooks/useFormHook";
import { AttendanceLocationAOS } from "../types";
import GoogleMap from "./googleMap";

export interface TimeAndAttendaceProps {
  form: UseFormReturn<ScheduleRulesFormValues>;
  locationLat: number;
  locationLng: number;
  isDisabled: boolean;
  polygonList?: PolygonListItem[];
  setPolygonInfo: (polygonList: AttendanceLocationAOS[]) => void;
}

export interface PolygonListItem {
  type: "CHECK_IN" | "CHECK_OUT";
  data: any[] | google.maps.MVCArray<any>;
}

const TimeAndAttendace = (props: TimeAndAttendaceProps) => {
  const {
    form,
    locationLat,
    locationLng,
    isDisabled,
    polygonList,
    setPolygonInfo,
  } = props;
  const isBreakTimeEnabled = form.watch("isBreakTimeEnabled");

  useEffect(() => {
    if (!isBreakTimeEnabled) {
      form.setValue("isBreakTimeEnabledInner.maxMealBreakTimeMins", "30");

      form.setValue("isBreakTimeEnabledInner", null);
    } else {
      form.setValue("isBreakTimeEnabledInner.maxMealBreakTimeMins", "30");
      form.clearErrors("isBreakTimeEnabledInner.maxMealBreakTimeMins");
    }
  }, [isBreakTimeEnabled]);

  return (
    <div className="pb-[200px]">
      <div className="flex items-center gap-2 text-[16] leading-10 text-[#324664] font-[420]">
        <FileIcon width="16" height="16" className="" />
        <div>Time and Attendance Rules</div>
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
                    {`1.NASTi's time and attendance system is based on certain
                    geolocation rules that you establish are designed to work
                    with your employees' NASTi app. They will need to turn their
                    geolocation services on for this function to work. Otherwise
                    you will need to manually check them in and out every time.​`}
                  </p>

                  <p>
                    {`2.We recommend making the "check in" location relatively
                    small. This will ensure employees enter the building in
                    order to check in and will prevent abuse of your check in
                    policies.`}
                  </p>

                  <p>
                    3.For check out, we highly recommend making the check out
                    area larger so that employees may move around your community
                    or campus without fear of automatically being checked out
                    prematurely.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="text-[#324664] font-[390] text-[16px] leading-10">
        (1) Check-in & Check-out Area
      </div>
      <div className="h-[400px] w-full mt-2 mb-4 overflow-hidden">
        <GoogleMap
          disabled={isDisabled}
          locationLng={locationLng}
          locationLat={locationLat}
          polygonList={polygonList}
          setPolygonInfo={setPolygonInfo}
        />
      </div>
      <div className="text-[#324664] font-[390] text-[16px] leading-9">
        (2) Check-in Rules
      </div>
      <FormField
        control={form.control}
        name="checkinMaxMins"
        render={({ field, formState }) => (
          <div className="mb-[9px]">
            <CustomFormItem
              isShowMessage={false}
              // labelClassName="text-[16px] text-[#919FB4] font-[390] leading-10"
              // label="Can't check in more than the following minutes before the shift starts."
            >
              <div className="flex items-center gap-4 text-[#919FB4] text-[16px] font-[390]">
                <div>{`Can't check in more than`}</div>
                <Input
                  disabled={isDisabled}
                  placeholder="Enter Number"
                  className={cn(
                    !formState?.errors?.checkinMaxMins
                      ? "border-[#E2E8F0]"
                      : "border-[#FF4D4F]"
                  )}
                  {...field}
                  onChange={(e) => {
                    e.stopPropagation();
                    const value = e.target.value;
                    if (!isNaN(Number(value)) && Number(value) >= 0) {
                      field.onChange(e);
                    }
                  }}
                />
                <div>minutes before the shift starts.</div>
              </div>
            </CustomFormItem>
          </div>
        )}
      />
      <FormField
        control={form.control}
        name="checkinExceptionMaxMins"
        render={({ field, formState }) => (
          <div className="mb-[9px]">
            <CustomFormItem
              isShowMessage={false}
              // labelClassName="text-[16px] text-[#919FB4] font-[390] leading-10"
              // label="Create an exception if check-in was more than the following minutes after the shift starts."
            >
              <div className="flex items-center gap-4 text-[#919FB4] text-[16px] font-[390]">
                <div>Create an exception if check-in was more than</div>
                <Input
                  disabled={isDisabled}
                  placeholder="Enter Number"
                  className={cn(
                    !formState?.errors?.checkinExceptionMaxMins
                      ? "border-[#E2E8F0]"
                      : "border-[#FF4D4F]"
                  )}
                  {...field}
                  onChange={(e) => {
                    e.stopPropagation();
                    const value = e.target.value;
                    if (!isNaN(Number(value)) && Number(value) >= 0) {
                      field.onChange(e);
                    }
                  }}
                />
                <div>minutes after the shift starts.</div>
              </div>
            </CustomFormItem>
          </div>
        )}
      />
      <div className="mt-[23px] text-[#324664] font-[390] text-[16px] leading-9">
        (3) Check-out Rules
      </div>
      <FormField
        control={form.control}
        name="checkoutExceptionAfterMins"
        render={({ field, formState }) => (
          <div className="mb-[9px]">
            <CustomFormItem
              isShowMessage={false}
              // labelClassName="text-[16px] text-[#919FB4] font-[390] leading-10"
              // // label="Can't check in more than the following minutes before the shift starts."
              // label="Create an exception if check out was more than the following minutes after the shift ends."
            >
              <div className="flex items-center gap-4 text-[#919FB4] text-[16px] font-[390]">
                <div>Create an exception if check out was more than</div>
                <Input
                  disabled={isDisabled}
                  placeholder="Enter Number"
                  className={cn(
                    !formState?.errors?.checkoutExceptionAfterMins
                      ? "border-[#E2E8F0]"
                      : "border-[#FF4D4F]"
                  )}
                  {...field}
                  onChange={(e) => {
                    e.stopPropagation();
                    const value = e.target.value;
                    if (!isNaN(Number(value)) && Number(value) >= 0) {
                      field.onChange(e);
                    }
                  }}
                />
                <div>minutes after the shift ends.</div>
              </div>
            </CustomFormItem>
          </div>
        )}
      />
      <FormField
        control={form.control}
        name="checkoutExceptionBeforeMins"
        render={({ field, formState }) => (
          <div className="mb-[9px]">
            <CustomFormItem
              isShowMessage={false}
              // labelClassName="text-[16px] text-[#919FB4] font-[390] leading-10"
              // // label="Can't check in more than the following minutes before the shift starts."
              // label="Create an exception if check out was more than the following minutes before the shift ends."
            >
              <div className="flex items-center gap-4 text-[#919FB4] text-[16px] font-[390]">
                <div>Create an exception if check out was more than</div>
                <Input
                  disabled={isDisabled}
                  placeholder="Enter Number"
                  className={cn(
                    !formState?.errors?.checkoutExceptionBeforeMins
                      ? "border-[#E2E8F0]"
                      : "border-[#FF4D4F]"
                  )}
                  {...field}
                  onChange={(e) => {
                    e.stopPropagation();
                    const value = e.target.value;
                    if (!isNaN(Number(value)) && Number(value) >= 0) {
                      field.onChange(e);
                    }
                  }}
                />
                <div>minutes before the shift ends.</div>
              </div>
            </CustomFormItem>
          </div>
        )}
      />
      <div className="mt-[23px] text-[#324664] font-[390] text-[16px] leading-9">
        (4) Break Time Rules
      </div>
      <FormField
        control={form.control}
        name="isBreakTimeEnabled"
        render={({ field, formState }) => {
          return (
            <div className="flex items-center flex-wrap gap-[15px] w-full min-h-10 mb-[10px]">
              <div
                className={cn(
                  "flex items-center flex-wrap  gap-4 leading-10 font-[390] text-[16px] text-[#919FB4]"
                )}
              >
                Create an exception if at least one documented break for a
                single shift does not equal or exceed{" "}
                <FormField
                  control={form.control}
                  name="isBreakTimeEnabledInner.maxMealBreakTimeMins"
                  render={({ field, formState }) => {
                    return (
                      <div className="flex items-center gap-4 text-[#919FB4] text-[16px] font-[390]">
                        <Input
                          disabled={isDisabled || !isBreakTimeEnabled}
                          placeholder="Enter Number"
                          className={cn(
                            !formState?.errors?.isBreakTimeEnabledInner
                              ?.maxMealBreakTimeMins
                              ? "border-[#E2E8F0]"
                              : "border-[#FF4D4F]"
                          )}
                          {...field}
                          onChange={(e) => {
                            e.stopPropagation();
                            const value = e.target.value;
                            if (!isNaN(Number(value)) && Number(value) >= 0) {
                              field.onChange(e);
                            }
                          }}
                        />
                      </div>
                    );
                  }}
                />
                minutes.
                <Switch
                  disabled={isDisabled}
                  name={field.name}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            </div>
          );
        }}
      />
      {/* {isBreakTimeEnabled && (
        <FormField
          control={form.control}
          name="isBreakTimeEnabledInner.maxMealBreakTimeMins"
          render={({ field, formState }) => {
            return (
              <div className="mb-[9px]">
                <div className="flex items-center gap-4 text-[#919FB4] text-[16px] font-[390]">
                  <Input
                    disabled={isDisabled}
                    placeholder="Enter Number"
                    className={cn(
                      !formState?.errors?.isBreakTimeEnabledInner
                        ?.maxMealBreakTimeMins
                        ? "border-[#E2E8F0]"
                        : "border-[#FF4D4F]"
                    )}
                    {...field}
                    onChange={(e) => {
                      e.stopPropagation();
                      const value = e.target.value;
                      if (!isNaN(Number(value)) && Number(value) >= 0) {
                        field.onChange(e);
                      }
                    }}
                  />
                  <div>minutes</div>
                </div>
              </div>
            );
          }}
        />
      )} */}
      <FormField
        control={form.control}
        name="defaultBreakTimeMins"
        render={({ field, formState }) => {
          return (
            <div className="mb-[9px]">
              <div className="flex items-center flex-wrap gap-4 text-[#919FB4] text-[16px] font-[390]">
                <span>
                  All employees must take at least one meal break of at least
                </span>
                <Input
                  disabled={isDisabled}
                  placeholder="Enter Number"
                  className={cn(
                    !formState?.errors?.defaultBreakTimeMins
                      ? "border-[#E2E8F0]"
                      : "border-[#FF4D4F]"
                  )}
                  {...field}
                  onChange={(e) => {
                    e.stopPropagation();
                    const value = e.target.value;
                    if (!isNaN(Number(value)) && Number(value) >= 0) {
                      field.onChange(e);
                    }
                  }}
                />
                <span>
                  minutes for every 8 hours of work (typically for a meal).
                </span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default TimeAndAttendace;
