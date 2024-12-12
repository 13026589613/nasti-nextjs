import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  overtimeRule: z.string().min(1, {
    message: "This field is required.",
  }),
  overtimeRulesInner: z
    .object({
      overtimeMessageHrs: z.string().nullish(),
    })
    .nullish(),
  overtimeRulesInnerNext: z
    .object({
      overtimeEmployeeHrs: z.string(),
      overtimeCommunityHrs: z.string(),
    })
    .nullish(),
  openShiftRule: z.string().min(1, {
    message: "This field is required.",
  }),
  openShiftClaimMinsAuto: z.string().min(1, {
    message: "This field is required.",
  }),
  openShiftClaimMinsApprove: z.string().min(1, {
    message: "This field is required.",
  }),
  partialShiftRule: z.string().min(1, {
    message: "This field is required.",
  }),
  partialShiftInner: z
    .object({
      partialShiftMinHrs: z
        .string()
        .min(1, { message: "This field is required." }),
      partialShiftAutoApprove: z.boolean(),
      partialShiftInnerNext: z
        .object({
          partialShiftRemainingMinHrs: z
            .string()
            .min(1, { message: "This field is required." }),
        })
        .nullable(),
    })
    .nullish(),
  swapRule: z.string().min(1, {
    message: "This field is required.",
  }),
  swapAllowHrs: z.string(),
  swapAllowHrs2: z.string(),
  ufgRule: z.string().min(1, {
    message: "This field is required.",
  }),
  ufgAllowHrs: z.string(),
  ufgAllowHrs2: z.string(),

  calloffRule: z.string().min(1, { message: "This field is required." }),
  calloffRuleInner: z
    .object({
      calloffAllowHrs: z
        .string()
        .min(1, { message: "This field is required." }),
    })
    .nullish(),

  checkinMaxMins: z.string().min(1, { message: "This field is required." }),
  checkinExceptionMaxMins: z
    .string()
    .min(1, { message: "This field is required." }),
  checkoutExceptionAfterMins: z
    .string()
    .min(1, { message: "This field is required." }),
  checkoutExceptionBeforeMins: z
    .string()
    .min(1, { message: "This field is required." }),
  isBreakTimeEnabled: z.boolean(),
  isBreakTimeEnabledInner: z
    .object({
      maxMealBreakTimeMins: z
        .string()
        .min(1, { message: "This field is required." }),
    })
    .nullable(),
  defaultBreakTimeMins: z
    .string()
    .min(1, { message: "This field is required." }),
  sendToKareRule: z.string().min(1, {
    message: "This field is required.",
  }),
  sendToKareStartDayInner: z
    .object({
      sendToKareStartDay: z.string().min(1, {
        message: "This field is required.",
      }),
    })
    .nullable(),
  sendToKareStartDayInnerNext: z
    .object({
      sendKareManuallyNotification: z.boolean(),
      sendKareManuallyNotificationInner: z
        .object({
          sendKareManuallyNotificationDay: z
            .string()
            .min(1, { message: "This field is required." }),
        })
        .nullable(),
    })
    .nullable(),
});

export type ScheduleRulesFormValues = z.infer<typeof FormSchema>;
const useFormCreate = ({}: {}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      overtimeRule: "",
      overtimeRulesInner: null,
      overtimeRulesInnerNext: null,
      openShiftRule: "",
      openShiftClaimMinsApprove: "0",
      openShiftClaimMinsAuto: "0",
      partialShiftRule: "",
      partialShiftInner: null,
      swapRule: "",
      ufgRule: "",
      calloffRule: "",
      calloffRuleInner: null,
      checkinMaxMins: "5",
      checkinExceptionMaxMins: "15",
      checkoutExceptionAfterMins: "15",
      checkoutExceptionBeforeMins: "15",
      isBreakTimeEnabled: false,
      isBreakTimeEnabledInner: null,
      ufgAllowHrs: "4",
      ufgAllowHrs2: "4",
      defaultBreakTimeMins: "30",
      sendToKareRule: "",
      sendToKareStartDayInner: {
        sendToKareStartDay: "4",
      },
      sendToKareStartDayInnerNext: null,
      swapAllowHrs: "4",
      swapAllowHrs2: "4",
    },
  });

  return {
    form,
  };
};

export default useFormCreate;
