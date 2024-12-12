"use client";

import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import { getCommunityInfo } from "@/api/community";
import {
  createCommunityRuleInfo,
  editCommunityRuleInfo,
  getCommunityRuleCodeList,
  getCommunityRuleInfo,
} from "@/api/scheduleRules";
import AuthProvide from "@/components/custom/Auth";
import Button from "@/components/custom/Button";
import CustomForm from "@/components/custom/Form";
import { FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MESSAGE } from "@/constant/message";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useAuthStore from "@/store/useAuthStore";
import { getSquareCorners } from "@/utils/googleMap";
import { getDefaultValue } from "@/utils/scheduleRule";
import TriangleIcon from "~/icons/TriangleIcon.svg";

import CallOff from "./components/callOff";
import OpenShift from "./components/openShift";
import OvertimeRules from "./components/overtimeRules";
import PartialShift from "./components/partialShift";
import SendToKare from "./components/sendToKare";
import SwapRules from "./components/swapRules";
import TimeAndAttendace, {
  PolygonListItem,
} from "./components/timeAndAttendace";
import UpforGrabs from "./components/upforGrabs";
import useFormCreate, { ScheduleRulesFormValues } from "./hooks/useFormHook";
import {
  AttendanceLocationAOS,
  CommunityRuleCodeListResponse,
  CreateCommunityRuleInfoInput,
} from "./types";

interface ScheduleRulesProps {
  communityId: string;
  setIndex: (index: number) => void;
  afterSave?: (communityId?: string) => void;
  scrollRef?: RefObject<HTMLDivElement>;
  pageIndex: number;
  className?: string;
  isEdit?: boolean;
  isCreate?: boolean;
}

export default function ScheduleRules({
  communityId,
  scrollRef,
  setIndex,
  pageIndex,
  afterSave,
  className,
  isEdit = false,
  isCreate = false,
}: ScheduleRulesProps) {
  const pathname = usePathname();
  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const [isDisabled, setIsDisabled] = useState(false);
  const { form } = useFormCreate({});
  const [loading, setLoading] = useState(false);
  const [ruleId, setRuleId] = useState<string>("");
  const [ruleCode, setRuleCode] = useState<CommunityRuleCodeListResponse>([]);
  const scrollAreaRef = useRef<any>(null);
  const overtimeRuleRef = useRef<any>(null);
  const openShiftRuleRef = useRef<any>(null);
  const partialShiftRuleRef = useRef<any>(null);
  const swapRuleRef = useRef<any>(null);
  const ufgRuleRef = useRef<any>(null);
  const calloffRuleRef = useRef<any>(null);
  const sendToKareRuleRef = useRef<any>(null);
  const timeAndAttendaceRef = useRef<any>(null);
  const [infoLat, setInfoLat] = useState(0);
  const [infoLng, setInfoLng] = useState(0);
  const attendanceEnabled = useRef(false);

  const [polygonList, setPolygonList] = useState<PolygonListItem[]>([]);

  const [polygonInfo, setPolygonInfo] = useState<AttendanceLocationAOS[]>([]);

  const [activeMenu, setActiveMenu] = useState("overtimeRule" as string);

  const submit = async (data: ScheduleRulesFormValues) => {
    setLoading(true);
    if (data.overtimeRule === "OT_NOTIFICATION_REQUIRED") {
      if (
        !data.overtimeRulesInnerNext?.overtimeEmployeeHrs &&
        !data.overtimeRulesInnerNext?.overtimeCommunityHrs
      ) {
        setLoading(false);
        form.setError("overtimeRulesInnerNext.overtimeEmployeeHrs", {
          type: "manual",
          message: "required",
        });
        form.setError("overtimeRulesInnerNext.overtimeCommunityHrs", {
          type: "manual",
          message: "required",
        });
        toast.warning("Please fill in at least one.");
        return;
      }
    }

    if (polygonInfo.length === 0 && attendanceEnabled.current) {
      setLoading(false);
      toast.warning("Please set both Check In Area and Check Out Area.");
      return;
    }

    if (attendanceEnabled.current) {
      for (let index = 0; index < polygonInfo.length; index++) {
        const element = polygonInfo[index];
        if (element.coordinates.length < 3) {
          setLoading(false);
          toast.warning("Please set both Check In Area and Check Out Area.");
          return;
        }
      }
    }

    let swapAllowHrs: string | null =
      data.swapRule === "SCHEDULER_APPROVE_SWAPS"
        ? data.swapAllowHrs
        : data.swapAllowHrs2;

    if (data.swapRule === "NO_SHIFT_SWAPS") {
      swapAllowHrs = null;
    }

    let ufgAllowHrs: string | null =
      data.ufgRule === "APPROVE_COVERAGE"
        ? data.ufgAllowHrs
        : data.ufgAllowHrs2;

    if (data.ufgRule === "NO_COVERAGE") {
      ufgAllowHrs = null;
    }

    const params: CreateCommunityRuleInfoInput = {
      communityId: communityId,
      overtimeRule: data.overtimeRule,
      overtimeMessageHrs: data.overtimeRulesInner?.overtimeMessageHrs || null,
      overtimeEmployeeHrs: data.overtimeRulesInnerNext?.overtimeEmployeeHrs,
      overtimeCommunityHrs: data.overtimeRulesInnerNext?.overtimeCommunityHrs,
      openShiftRule: data.openShiftRule,
      partialShiftRule: data.partialShiftRule,
      partialShiftMinHrs: data.partialShiftInner?.partialShiftMinHrs,
      partialShiftAutoApprove: data.partialShiftInner?.partialShiftAutoApprove,
      partialShiftRemainingMinHrs:
        data.partialShiftInner?.partialShiftInnerNext
          ?.partialShiftRemainingMinHrs,
      swapRule: data.swapRule,
      ufgRule: data.ufgRule,
      calloffRule: data.calloffRule,
      calloffAllowHrs: data.calloffRuleInner?.calloffAllowHrs,
      checkinMaxMins: Number(data.checkinMaxMins),
      checkinExceptionMaxMins: Number(data.checkinExceptionMaxMins),
      checkoutExceptionAfterMins: Number(data.checkoutExceptionAfterMins),
      checkoutExceptionBeforeMins: Number(data.checkoutExceptionBeforeMins),
      isBreakTimeEnabled: data.isBreakTimeEnabled,
      maxMealBreakTimeMins: Number(
        data.isBreakTimeEnabledInner?.maxMealBreakTimeMins
      ),
      defaultBreakTimeMins: Number(data.defaultBreakTimeMins),

      sendToKareRule: data.sendToKareRule,
      sendToKareStartDay: data.sendToKareStartDayInner?.sendToKareStartDay
        ? Number(data.sendToKareStartDayInner?.sendToKareStartDay)
        : null,
      ufgAllowHrs: ufgAllowHrs ? Number(ufgAllowHrs) : null,
      swapAllowHrs: swapAllowHrs ? Number(swapAllowHrs) : null,
      openShiftClaimMins:
        data.openShiftRule === "AUTO_APPROVE_QUALIFIED_SHIFT"
          ? Number(data.openShiftClaimMinsAuto)
          : Number(data.openShiftClaimMinsApprove),
      sendKareManuallyNotification:
        data.sendToKareStartDayInnerNext?.sendKareManuallyNotification,
      sendKareManuallyNotificationDay: data.sendToKareStartDayInnerNext
        ?.sendKareManuallyNotificationInner?.sendKareManuallyNotificationDay
        ? Number(
            data.sendToKareStartDayInnerNext?.sendKareManuallyNotificationInner
              ?.sendKareManuallyNotificationDay
          )
        : null,
      attendanceLocationAOS: attendanceEnabled.current ? polygonInfo : null,
    };
    try {
      if (ruleId) {
        const res = await editCommunityRuleInfo({
          ...params,
          id: ruleId,
        });
        if (res.code === 200) {
          toast.success(MESSAGE.save, { position: "top-center" });
          if (pathname === "/myCommunity") {
            getCommunityRuleInfoFn();
          } else {
            useAppStore.getState().setIsRefreshAuth(true);
          }
          afterSave && afterSave();
        }
      } else {
        const res = await createCommunityRuleInfo(params);
        if (res.code === 200) {
          toast.success(MESSAGE.save, { position: "top-center" });
          afterSave && afterSave(communityId);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getCommunityRuleInfoFn = async () => {
    try {
      const res = await getCommunityRuleInfo(communityId);
      if (res.code == 200) {
        const data = res.data;
        if (data?.id) {
          form.setValue("defaultBreakTimeMins", data.defaultBreakTimeMins + "");

          setRuleId(data.id);
          form.setValue("overtimeRule", data.overtimeRule + "");
          if (data.overtimeRule === "OT_LIMITED") {
            setTimeout(() => {
              form.setValue("overtimeRulesInner", {
                overtimeMessageHrs: data.overtimeMessageHrs
                  ? data.overtimeMessageHrs + ""
                  : "",
              });
            }, 50);
          }

          setTimeout(() => {
            if (data.overtimeRule === "OT_NOTIFICATION_REQUIRED") {
              form.setValue("overtimeRulesInnerNext", {
                overtimeEmployeeHrs: data.overtimeEmployeeHrs
                  ? data.overtimeEmployeeHrs + ""
                  : "",
                overtimeCommunityHrs: data.overtimeCommunityHrs
                  ? data.overtimeCommunityHrs + ""
                  : "",
              });
            }
          }, 50);
          form.setValue("openShiftRule", data.openShiftRule);

          if (data.openShiftRule === "AUTO_APPROVE_QUALIFIED_SHIFT") {
            form.setValue(
              "openShiftClaimMinsAuto",
              data.openShiftClaimMins + ""
            );
          } else {
            form.setValue(
              "openShiftClaimMinsApprove",
              data.openShiftClaimMins + ""
            );
          }

          form.setValue("partialShiftRule", data.partialShiftRule);

          setTimeout(() => {
            if (data.partialShiftRule === "ALLOW_PARTIAL_SHIFTS") {
              let res: any = {
                partialShiftMinHrs: data.partialShiftMinHrs + "",
                partialShiftAutoApprove: data.partialShiftAutoApprove,
                partialShiftInnerNext: null,
              };
              form.setValue("partialShiftInner", res);
              setTimeout(() => {
                if (data.partialShiftAutoApprove) {
                  form.setValue(
                    "partialShiftInner.partialShiftInnerNext.partialShiftRemainingMinHrs",
                    data.partialShiftRemainingMinHrs + ""
                  );
                }
              }, 50);
            }
          }, 50);

          form.setValue("swapRule", data.swapRule);

          setTimeout(() => {
            if (data.swapRule === "SCHEDULER_APPROVE_SWAPS") {
              form.setValue("swapAllowHrs", data.swapAllowHrs + "");
            }
            if (data.swapRule === "AUTO_APPROVE_SWAPS") {
              form.setValue("swapAllowHrs2", data.swapAllowHrs + "");
            }
          }, 50);

          form.setValue("ufgRule", data.ufgRule);

          setTimeout(() => {
            if (data.ufgRule === "APPROVE_COVERAGE") {
              form.setValue("ufgAllowHrs", data.ufgAllowHrs + "");
            }
            if (data.ufgRule === "AUTO_COVERAGE") {
              form.setValue("ufgAllowHrs2", data.ufgAllowHrs + "");
            }
          }, 50);

          form.setValue("calloffRule", data.calloffRule);

          setTimeout(() => {
            if (data.calloffRule === "ALLOW_CALL_OFF_WITHIN_HOURS") {
              form.setValue("calloffRuleInner", {
                calloffAllowHrs: data.calloffAllowHrs + "",
              });
            }
          }, 50);

          form.setValue("sendToKareRule", data.sendToKareRule);

          setTimeout(() => {
            if (data.sendToKareRule === "SHIFT_OPEN_START_DAY") {
              form.setValue("sendToKareStartDayInner", {
                sendToKareStartDay: data.sendToKareStartDay + "",
              });
            } else if (data.sendToKareRule === "MANUALLY_SHIFT_TO_KARE") {
              form.setValue("sendToKareStartDayInnerNext", {
                sendKareManuallyNotification: data.sendKareManuallyNotification,
                sendKareManuallyNotificationInner: {
                  sendKareManuallyNotificationDay:
                    data.sendKareManuallyNotificationDay + "",
                },
              });
            }
          }, 50);

          form.setValue("checkinMaxMins", data.checkinMaxMins + "");
          form.setValue(
            "checkinExceptionMaxMins",
            data.checkinExceptionMaxMins + ""
          );
          form.setValue(
            "checkoutExceptionAfterMins",
            data.checkoutExceptionAfterMins + ""
          );
          form.setValue(
            "checkoutExceptionBeforeMins",
            data.checkoutExceptionBeforeMins + ""
          );
          form.setValue("isBreakTimeEnabled", data.isBreakTimeEnabled);

          setTimeout(() => {
            if (data.isBreakTimeEnabled) {
              form.setValue("isBreakTimeEnabledInner", {
                maxMealBreakTimeMins: data.maxMealBreakTimeMins + "",
              });
            }
          }, 50);

          if (data.attendanceLocationAOS && data.attendanceLocationAOS.length) {
            const res = data.attendanceLocationAOS.map((item) => {
              return {
                type: item.type,
                data: item.coordinates.map((inner) => ({
                  lat: inner[0],
                  lng: inner[1],
                })),
              };
            });
            setPolygonList(res);
          }
        }
        return data?.id;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const [pageDataLoading, setPageDataLoading] = useState<boolean>(false);

  const getCommunityRuleCodeListFn = async () => {
    try {
      setPageDataLoading(true);
      const res = await getCommunityRuleCodeList();
      if (res.code === 200) {
        setRuleCode(res.data);

        form.setValue(
          "overtimeRule",
          getDefaultValue("OvertimeRules", res.data)
        );
        form.setValue(
          "openShiftRule",
          getDefaultValue("OpenShiftRules", res.data)
        );
        form.setValue(
          "partialShiftRule",
          getDefaultValue("PartialShiftRules", res.data)
        );
        form.setValue("swapRule", getDefaultValue("SwapRules", res.data));
        form.setValue("ufgRule", getDefaultValue("UpforGrabsRules", res.data));
        form.setValue("calloffRule", getDefaultValue("CoffRules", res.data));
        form.setValue(
          "sendToKareRule",
          getDefaultValue("SendToKareRules", res.data)
        );

        await getCommunityRuleInfoFn();
      }
    } finally {
      setTimeout(() => {
        setPageDataLoading(false);
      }, 100);
    }
  };

  const [loadingCommunityInfo, setLoadingCommunityInfo] =
    useState<boolean>(false);

  const getGeoLocation = async () => {
    try {
      setLoadingCommunityInfo(true);
      const res = await getCommunityInfo(communityId);
      if (res.code == 200) {
        const data = res.data;
        setInfoLat(data.locationLat);
        setInfoLng(data.locationLng);

        if (data) {
          attendanceEnabled.current = data.attendanceEnabled;
        }

        if (data.attendanceEnabled) {
          setPolygonList([
            {
              type: "CHECK_IN",
              data: getSquareCorners(data.locationLat, data.locationLng, 50),
            },
            {
              type: "CHECK_OUT",
              data: getSquareCorners(data.locationLat, data.locationLng, 300),
            },
          ]);
        }
      }
    } finally {
      setLoadingCommunityInfo(false);
    }
  };

  const init = async () => {
    await getGeoLocation();
    getCommunityRuleCodeListFn();
  };

  useEffect(() => {
    init();
    if (pathname === "/myCommunity") {
      if (
        permission.includes("COMMUNITY_MANAGEMENT_EDIT") &&
        permission.includes("COMMUNITY_MANAGEMENT_EDIT_RULES")
      ) {
        setIsDisabled(false);
      } else {
        setIsDisabled(true);
      }
    } else {
      setIsDisabled(false);
    }
  }, [communityId]);

  const scrollEvent = (event: any) => {
    if (fobiddenScrollEvent.current) {
      return;
    }

    const scrollTop = event.target.scrollTop;
    const overtimeRuleRefHeight = overtimeRuleRef.current.offsetTop;
    const openShiftRuleRefHeight = openShiftRuleRef.current.offsetTop;
    const partialShiftRuleRefHeight = partialShiftRuleRef.current.offsetTop;
    const swapRuleRefHeight = swapRuleRef.current.offsetTop;
    const ufgRuleRefHeight = ufgRuleRef.current.offsetTop;
    const calloffRuleRefHeight = calloffRuleRef.current.offsetTop;
    const sendToKareRuleRefHeight = sendToKareRuleRef.current.offsetTop;
    const timeAndAttendaceRefHeight = timeAndAttendaceRef.current.offsetTop;

    let offset = 0;

    if (pathname === "/community/create") {
      offset = -140;
    }

    if (pathname === "/onboarding/community") {
      offset = -230;
    }

    if (
      scrollTop >= overtimeRuleRefHeight - offset &&
      scrollTop < openShiftRuleRefHeight - offset
    ) {
      setActiveMenu("overtimeRule");
    } else if (
      scrollTop >= openShiftRuleRefHeight - offset &&
      scrollTop < partialShiftRuleRefHeight - offset
    ) {
      setActiveMenu("openShiftRule");
    } else if (
      scrollTop >= partialShiftRuleRefHeight - offset &&
      scrollTop < swapRuleRefHeight - offset
    ) {
      setActiveMenu("partialShiftRule");
    } else if (
      scrollTop >= swapRuleRefHeight - offset &&
      scrollTop < ufgRuleRefHeight - offset
    ) {
      setActiveMenu("swapRule");
    } else if (
      scrollTop >= ufgRuleRefHeight - offset &&
      scrollTop < calloffRuleRefHeight - offset
    ) {
      setActiveMenu("ufgRule");
    } else if (
      scrollTop >= calloffRuleRefHeight - offset &&
      scrollTop < sendToKareRuleRefHeight - offset
    ) {
      setActiveMenu("calloffRule");
    } else if (
      scrollTop >= sendToKareRuleRefHeight - offset &&
      scrollTop < timeAndAttendaceRefHeight - offset
    ) {
      setActiveMenu("sendToKareRule");
    } else if (scrollTop >= timeAndAttendaceRefHeight - offset) {
      setActiveMenu("timeAndAttendace");
    }
  };

  useEffect(() => {
    if (scrollRef && scrollRef.current) {
      const div: any = scrollRef.current.querySelector("div");
      div.addEventListener("scroll", scrollEvent);
    } else {
      if (scrollAreaRef.current) {
        const div = scrollAreaRef.current.querySelector("div");
        div.addEventListener("scroll", scrollEvent);
      }
    }

    return () => {
      if (scrollRef && scrollRef.current) {
        const div: any = scrollRef.current.querySelector("div");
        div.removeEventListener("scroll", scrollEvent);
      } else {
        if (scrollAreaRef.current) {
          const div = scrollAreaRef.current.querySelector("div");
          div.removeEventListener("scroll", scrollEvent);
        }
      }
    };
  }, [scrollAreaRef, scrollRef]);

  const menu = useMemo(() => {
    let res = [
      {
        label: "Overtime Rules",
        key: "overtimeRule",
      },
      {
        label: "Open Shift Rules",
        key: "openShiftRule",
      },
      {
        label: "Partial Shift Rules",
        key: "partialShiftRule",
      },
      {
        label: "Swap Rules",
        key: "swapRule",
      },
      {
        label: "Up for Grabs Rules",
        key: "ufgRule",
      },
      {
        label: "Call off Rules",
        key: "calloffRule",
      },
      {
        label: "Send to KARE Rules",
        key: "sendToKareRule",
      },
    ];
    if (attendanceEnabled.current) {
      return [
        ...res,
        {
          label: "Time and Attendance Rules",
          key: "timeAndAttendace",
        },
      ];
    }
    return res;
  }, [attendanceEnabled.current]);

  const fobiddenScrollEvent = useRef(false);

  const clickMenu = (key: string) => {
    fobiddenScrollEvent.current = true;
    switch (key) {
      case "overtimeRule":
        overtimeRuleRef.current.scrollIntoView({
          block: "start",
          inline: "nearest",
        });
        break;
      case "openShiftRule":
        openShiftRuleRef.current.scrollIntoView({
          block: "start",
          inline: "nearest",
        });
        break;
      case "partialShiftRule":
        partialShiftRuleRef.current.scrollIntoView({
          block: "start",
          inline: "nearest",
        });
        break;
      case "swapRule":
        swapRuleRef.current.scrollIntoView({
          block: "start",
          inline: "nearest",
        });
        break;
      case "ufgRule":
        ufgRuleRef.current.scrollIntoView();
        break;
      case "calloffRule":
        calloffRuleRef.current.scrollIntoView();
        break;
      case "sendToKareRule":
        sendToKareRuleRef.current.scrollIntoView();
        break;
      case "timeAndAttendace":
        timeAndAttendaceRef.current.scrollIntoView();
        break;
    }

    setTimeout(() => {
      fobiddenScrollEvent.current = false;
    }, 100);
  };

  return (
    <div className={cn("w-full h-full mt-2 pb-[0px]", className)}>
      <CustomForm
        form={form}
        className="w-full h-full"
        onSubmit={(data) => {
          submit(data);
        }}
      >
        <div
          className={cn(
            "right-[10px] flex w-[268px] px-[23px] shadow-custom",
            "sticky  ml-[auto] z-10 ",
            isCreate && "absolute right-[10px] top-[144px]",
            !isCreate && "top-[40px]"
          )}
        >
          <div className="w-full h-full pl-[23px] border-l border-[#E7EDF1]">
            {menu.map((item: any, index: number) => (
              <div
                key={item.key}
                className={cn("relative w-full h-10 cursor-pointer")}
                onClick={() => {
                  setActiveMenu(item.key);
                  clickMenu(item.key);
                }}
              >
                <span
                  className={cn(
                    "h-10 leading-10 font-[420] text-[16px] flex items-center",
                    item.key === activeMenu
                      ? "text-[#EB1DB2]"
                      : "text-[#324664]"
                  )}
                >
                  {item.label}
                </span>
                {item.key === activeMenu && (
                  <TriangleIcon
                    className={
                      "absolute left-[-24px] top-[50%] translate-y-[-50%] text-[#EB1DB2]"
                    }
                    width={12}
                    height={12}
                  ></TriangleIcon>
                )}
              </div>
            ))}
          </div>
        </div>

        <ScrollArea
          ref={scrollAreaRef}
          className={cn(
            "w-full  mt-[-305px]",
            !attendanceEnabled.current && "mt-[-288px]",
            isCreate && "mt-[0px]"
          )}
        >
          <div className="w-full pl-[10px] pr-[288px]">
            <div ref={overtimeRuleRef}>
              <FormField
                control={form.control}
                name="overtimeRule"
                render={({ field, fieldState }) => {
                  return (
                    <OvertimeRules
                      ruleCode={ruleCode}
                      field={field}
                      form={form}
                      isDisabled={isDisabled}
                    ></OvertimeRules>
                  );
                }}
              />
            </div>
            <div ref={openShiftRuleRef}>
              <FormField
                control={form.control}
                name="openShiftRule"
                render={({ field, fieldState }) => {
                  return (
                    <OpenShift
                      isDisabled={isDisabled}
                      ruleCode={ruleCode}
                      field={field}
                      form={form}
                    ></OpenShift>
                  );
                }}
              />
            </div>
            <div ref={partialShiftRuleRef}>
              <FormField
                control={form.control}
                name="partialShiftRule"
                render={({ field, fieldState }) => {
                  return (
                    <PartialShift
                      ruleCode={ruleCode}
                      field={field}
                      form={form}
                      isDisabled={isDisabled}
                    ></PartialShift>
                  );
                }}
              />
            </div>
            <div ref={swapRuleRef}>
              <FormField
                control={form.control}
                name="swapRule"
                render={({ field, fieldState }) => {
                  return (
                    <SwapRules
                      ruleCode={ruleCode}
                      field={field}
                      form={form}
                      isDisabled={isDisabled}
                    ></SwapRules>
                  );
                }}
              />
            </div>
            <div ref={ufgRuleRef}>
              <FormField
                control={form.control}
                name="ufgRule"
                render={({ field, fieldState }) => {
                  return (
                    <UpforGrabs
                      ruleCode={ruleCode}
                      field={field}
                      form={form}
                      isDisabled={isDisabled}
                    ></UpforGrabs>
                  );
                }}
              />
            </div>
            <div ref={calloffRuleRef}>
              <FormField
                control={form.control}
                name="calloffRule"
                render={({ field, fieldState }) => {
                  return (
                    <CallOff
                      ruleCode={ruleCode}
                      field={field}
                      form={form}
                      isDisabled={isDisabled}
                    ></CallOff>
                  );
                }}
              />
            </div>

            <div ref={sendToKareRuleRef}>
              <FormField
                control={form.control}
                name="sendToKareRule"
                render={({ field, fieldState }) => {
                  return (
                    <SendToKare
                      ruleCode={ruleCode}
                      field={field}
                      form={form}
                      isDisabled={isDisabled}
                    ></SendToKare>
                  );
                }}
              />
            </div>

            <div ref={timeAndAttendaceRef}>
              {attendanceEnabled.current === true ? (
                <TimeAndAttendace
                  locationLng={infoLng}
                  locationLat={infoLat}
                  form={form}
                  isDisabled={isDisabled}
                  polygonList={polygonList}
                  setPolygonInfo={setPolygonInfo}
                ></TimeAndAttendace>
              ) : null}
            </div>
          </div>
        </ScrollArea>

        <AuthProvide
          authenticate={pathname === "/myCommunity"}
          permissionName="COMMUNITY_MANAGEMENT_EDIT_RULES"
        >
          {!isDisabled && (
            <div className="sticky bottom-[0px] left-0 right-[20px] bg-white mt-0 h-[80px] flex items-center justify-end pr-[10px]">
              {isEdit ? null : (
                <Button
                  className="w-[160px] text-[#F5894E] cursor-pointer"
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIndex(pageIndex - 1);
                  }}
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={() => {
                  useAppStore.getState().setStep(1);
                }}
                loading={loading}
                className="w-[160px]"
              >
                Save
              </Button>
            </div>
          )}
        </AuthProvide>
      </CustomForm>
      {(pageDataLoading || loadingCommunityInfo) && (
        <div className="flex items-center justify-center absolute top-0 left-0 z-[999]  w-full h-full bg-white">
          <Loader2 className="mr-2 font-[390] animate-spin opacity-[0.5]" />
        </div>
      )}
    </div>
  );
}
