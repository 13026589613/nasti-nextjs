"use client";
import { useSetState } from "ahooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { getNeedCoverageCount } from "@/api/shiftsThatNeedHelp";
import {
  initCallOffShiftDetail,
  loadCallOffShiftList,
  openShiftClaims,
  openShiftClaimsDetail,
  shiftUfgRequestList,
  ufgShiftDetail,
} from "@/api/shiftsThatNeedHelp/callOffShift/index";
import { overtimeBatch } from "@/api/shiftsThatNeedHelp/overTimeShift";
import {
  getOvertimeShifts,
  getOvertimeShiftsDetail,
} from "@/api/shiftsThatNeedHelp/overTimeShift";
import { OvertimeShiftVO } from "@/api/shiftsThatNeedHelp/overTimeShift/type";
import {
  getShiftSwaps,
  getShiftSwapsDetail,
} from "@/api/shiftsThatNeedHelp/shiftSwaps";
import { shiftSwapResVO } from "@/api/shiftsThatNeedHelp/shiftSwaps/type";
import { PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import Spin from "@/components/custom/Spin";
import CustomTable, {
  CustomColumnDef,
  RefProps,
} from "@/components/custom/Table";
import Tabs from "@/components/custom/Tabs";
import { FormItem, FormLabel } from "@/components/FormComponent";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import { NEED_HELP_SHIFT_STATUS_VALUE } from "@/constant/statusConstants";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import useMenuNumStore from "@/store/useMenuNumStore";

import EditOrView from "./components/EditOrView";
import TableSearchForm, { SearchParams } from "./components/SearchForm";
import useReturnTimeOffTableColumn from "./hooks/tableColumn";
import {
  GetShiftSwapsReq,
  NeedHelpShift,
  NeedHelpShiftStatusVo,
  OpenShiftClaimsParams,
  ShiftUfgRequestListParams,
  ShiftUfgRequestListRes,
  TimeOffStatus,
} from "./types";
import { isCanNotCheck } from "./utils";

export type NeedHelpShiftTabsKey =
  | "shiftSwaps"
  | "upForGrabs"
  | "callOffs"
  | "openShiftClaims"
  | "overtimeShifts";

export default function TimeOff() {
  const { communityId } = useGlobalCommunityId();
  const { departmentIds } = useGlobalDepartment();
  const { UTCMoment, localMoment, zoneAbbr } = useGlobalTime();
  const zoneString = zoneAbbr ? ` (${zoneAbbr})` : "";

  const [tabsOptions, setTabsOptions] = useState<
    {
      label: string;
      key: NeedHelpShiftTabsKey;
      unread: number | null;
    }[]
  >([
    {
      label: "Shift Swaps",
      key: "shiftSwaps",
      unread: null,
    },
    {
      label: "Up for Grabs",
      key: "upForGrabs",
      unread: null,
    },
    {
      label: "Call Offs",
      key: "callOffs",
      unread: null,
    },
    {
      label: "Open Shift Claims",
      key: "openShiftClaims",
      unread: null,
    },
    {
      label: "Overtime Shifts",
      key: "overtimeShifts",
      unread: null,
    },
  ]);
  const {
    control,
    setError,
    watch,
    formState: { errors },
    clearErrors,
    resetField,
  } = useForm<{
    comment: string;
  }>({
    defaultValues: {
      comment: "",
    },
  });
  const comment = watch("comment");
  const [currentView, setCurrentView] =
    useState<NeedHelpShiftTabsKey>("shiftSwaps");

  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    roleId: "",
    userId: "",
    status: "",
  });
  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 0,
  });

  const [listDataInfo, setListDataInfo] = useSetState({
    data: [] as NeedHelpShift[],
    loading: false,
  });

  const [currentColum, setCurrentColum] = useState<
    CustomColumnDef<NeedHelpShift>[]
  >([]);

  const [ReviewInfo, setReviewInfo] = useSetState({
    visible: false,
    type: "",
    isView: false,
    needHelpShift: null,
    loading: false,
  } as {
    visible: boolean;
    type: NeedHelpShiftTabsKey | "";
    isView: boolean;
    needHelpShift: NeedHelpShift | ShiftUfgRequestListRes | null;
    loading: boolean;
  });

  const [multipleReviewDia, setMultipleReviewDia] = useSetState<{
    open: boolean;
    type: NeedHelpShiftStatusVo;
  }>({
    open: false,
    type: "REJECTED",
  });
  const clickIcon = (icon: string, data: NeedHelpShift) => {
    if (ReviewInfo.loading) {
      return;
    }
    if (currentView === "callOffs") {
      apiLoadCallOffInfo(icon, data);
    } else if (currentView === "shiftSwaps") {
      openShiftSwapDetail(icon, data);
    } else if (currentView === "openShiftClaims") {
      openShiftClaimsDetailFn(icon, data);
    } else if (currentView === "upForGrabs") {
      ufgShiftDetailFn(icon, data);
    } else if (currentView === "overtimeShifts") {
      openOvertimeShiftDetail(icon, data);
    }
  };
  const tableRef = useRef<RefProps>(); // Table ref
  const {
    columns_call,
    columns_crabs,
    columns_swap,
    columns_claims,
    columns_overtime,
  } = useReturnTimeOffTableColumn({
    clickIcon,
    selectedRows,
    setSelectedRows,
  });

  const handleUTCTime = (
    time: string | null | undefined,
    hasZone: boolean,
    format?: string
  ) => {
    if (!time) return "";
    if (format)
      return UTCMoment(time).format(format) + (hasZone ? zoneString : "");
    return (
      `${UTCMoment(time).format("MM/DD/YYYY hh:mm A")}` +
      (hasZone ? zoneString : "")
    );
  };

  const canClickTab = useRef(true);

  // get table data
  const getDataListFn = async () => {
    setListDataInfo({
      loading: true,
    });
    canClickTab.current = false;
    try {
      const { roleId, userId, status } = searchParams;
      let params = {
        communityId: communityId,
        userId: userId === "" ? null : userId,
        status: status === "" ? null : status,
        departmentIds:
          departmentIds.join(",") === "" ? null : departmentIds.join(","),
        workerRoleId: roleId === "" ? null : roleId,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      };

      // change Web select status value to Back Eunm value
      params.status = NEED_HELP_SHIFT_STATUS_VALUE[
        params.status as keyof typeof NEED_HELP_SHIFT_STATUS_VALUE
      ] as NeedHelpShiftStatusVo;

      if (currentView === "callOffs") {
        await apiLoadCallOffList({
          ...params,
          departmentIds: departmentIds.join(",") || null,
        });
      } else if (currentView === "openShiftClaims") {
        let nowStatus =
          status === "APPROVED"
            ? "APPROVED"
            : status === "PENDING"
            ? "NEW"
            : "REJECT";
        await openShiftClaimsFn({
          pageNum: pagination.pageNum,
          pageSize: pagination.pageSize,
          communityId: communityId,
          departmentIds: departmentIds.join(","),
          userId: userId === "" ? null : userId,
          status: status ? nowStatus : null,
          workerRoleId: roleId === "" ? null : roleId,
        });
      } else if (currentView === "upForGrabs") {
        let nowStatus = status;

        switch (status) {
          case "APPROVED":
            nowStatus = "APPROVED";
            break;
          case "PENDING":
            nowStatus = "NEW";
            break;
          case "REJECTED":
            nowStatus = "REJECT";
            break;
          case "REQUESTED":
            nowStatus = "REQUESTED";
            break;
        }
        await ufgDataList({
          pageNum: pagination.pageNum,
          pageSize: pagination.pageSize,
          communityId: communityId,
          departmentIds:
            departmentIds.join(",") === "" ? null : departmentIds.join(","),
          userId: userId === "" ? null : userId,
          status: status ? nowStatus : null,
          workerRoleId: roleId === "" ? null : roleId,
        });
      } else if (currentView === "shiftSwaps") {
        await getShiftSwapsData({
          communityId,
          departmentIds: departmentIds.join(",") || null,
          workerRoleIds: searchParams.roleId || null,
          userIds: searchParams.userId || null,
          statuses:
            searchParams.status === "PENDING"
              ? "NEW"
              : searchParams.status === "REJECTED"
              ? "REJECT"
              : searchParams.status || null,
          pageNum: pagination.pageNum,
          pageSize: pagination.pageSize,
        });
      } else if (currentView === "overtimeShifts") {
        await getOvertimeShiftsData();
      }
    } finally {
      useMenuNumStore.getState().setIsRefreshShiftNeedHelp(true);
      setListDataInfo({
        loading: false,
      });
      canClickTab.current = true;
    }
  };

  // get shift swap list data
  const getShiftSwapsData = async (params: GetShiftSwapsReq) => {
    if (currentView !== "shiftSwaps") return;
    try {
      const { data, code } = await getShiftSwaps(params);
      if (code !== 200) return;
      setPagination({
        total: data.total,
      });
      setListDataInfo({
        data: handleshiftSwapsData(data.records),
      });
      setPagination({
        total: data.total,
      });
    } catch (error) {}
  };

  // get ufg list data
  const ufgDataList = async (params: ShiftUfgRequestListParams) => {
    try {
      const res = await shiftUfgRequestList(params);
      if (res.code === 200) {
        let listData: NeedHelpShift[] = [];
        setPagination({
          total: res.data.total,
        });
        res.data.records.map((data) => {
          listData.push({
            ...data,
            ...{
              partialShift: data?.ufgRequest.isPartial ? "Yes" : "No",
              proposer: `${data.username} (${handleUTCTime(
                data.ufgRequest.startTimeUtc,
                false
              )} - ${handleUTCTime(data.ufgRequest.endTimeUtc, true)})`,
              proposerId: data.userId,
              departmentName: data.departmentName,
              roleName: data.workerRoleName,
              status: data.status === "NEW" ? "PENDING" : data.status,
              shiftStartTime: handleUTCTime(
                data.ufgRequest.startTimeUtc,
                false
              ),
              shiftEndTime: handleUTCTime(data.ufgRequest.endTimeUtc, true),
              roleId: data.workerRoleId || "",
            },
          });
        });
        setListDataInfo({
          data: listData,
        });
      }
    } finally {
    }
  };

  // get call off list data
  const apiLoadCallOffList = (params: any) => {
    let listData: NeedHelpShift[] = [];
    loadCallOffShiftList(params)
      .then((res) => {
        setPagination({
          total: res.data.total,
        });
        res.data.records.map((data) => {
          listData.push({
            ...data,
            ...{
              departmentName: data.departmentName,
              proposer: `${data.username} (${handleUTCTime(
                data.startTime,
                false
              )} - ${handleUTCTime(data.endTime, true)})`,
              proposerId: data.userId,
              roleName: data.workerRoleName,
              status: data.status === "NEW" ? "PENDING" : data.status,
              shiftStartTime: handleUTCTime(data.startTime, false),
              shiftEndTime: handleUTCTime(data.endTime, true),
              roleId: data.workerRoleId,
            },
          });
        });

        setListDataInfo({
          data: listData,
        });
      })
      .finally(() => {});
  };

  // get open shift claims list data
  const openShiftClaimsFn = async (params: OpenShiftClaimsParams) => {
    try {
      const res = await openShiftClaims(params);
      if (res.code === 200) {
        let listData: NeedHelpShift[] = [];
        setPagination({
          total: res.data.total,
        });
        res.data.records.map((data) => {
          listData.push({
            ...data,
            ...{
              departmentName: data.departmentName,
              claimedBy: data.claimUsername,
              roleName: data.workerRoleName,
              status:
                data.reviewStatus === "NEW" ? "PENDING" : data.reviewStatus,
              shiftStartTime: handleUTCTime(data.startTimeUtc, false),
              shiftEndTime: handleUTCTime(data.endTimeUtc, true),
            },
          });
        });
        setListDataInfo({
          data: listData,
        });
      }
    } finally {
    }
  };

  // get Overtime Shifts list data
  const getOvertimeShiftsData = async () => {
    try {
      const status = searchParams.status;
      const { data, code } = await getOvertimeShifts({
        communityId: communityId || "",
        departmentIds: departmentIds.join(",") || null,
        workerRoleId: searchParams.roleId || null,
        userId: searchParams.userId || null,
        status:
          status === "PENDING"
            ? "NEW"
            : status === "REJECTED"
            ? "REJECT"
            : status === "APPROVED"
            ? "APPROVED"
            : null,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      });
      if (code !== 200) return;
      setPagination({
        total: data.total,
      });
      setListDataInfo({
        data: handleOvertimeData(data.records),
      });
      setPagination({
        total: data.total,
      });
    } catch (error) {}
  };

  // get shift swap detail
  const openShiftSwapDetail = async (icon: string, params: NeedHelpShift) => {
    try {
      const { data, code } = await getShiftSwapsDetail({
        reviewId: params.id,
        communityId,
      });

      if (code === 200) {
        const { shiftInfo, shiftUserProfile, swapRequestList } = data;

        turnDetailInfoPage(icon, {
          id: data.id || "",
          departmentId: shiftInfo?.departmentId || "",
          departmentName: shiftInfo?.departmentName || "",
          employee: "",
          employeeList: swapRequestList.map((request) => {
            const {
              targetShift,
              targetUserFirstName,
              targetUserLastName,
              targetUserPhone,
              targetUserId,
              targetTags,
            } = request;
            return {
              id: request.id || "",
              userId: targetUserId || "",
              status: request.status === "APPROVED_BY_SCHEDULER",
              employee: `${targetUserFirstName} ${targetUserLastName}`,
              phone: targetUserPhone || "",
              nationalPhone: shiftUserProfile.nationalPhone || "",
              location: targetShift?.locationRefVOs?.length
                ? targetShift?.locationRefVOs
                    .map((location) => location.locationName)
                    .join(",")
                : "",
              tags: targetTags,
              note: targetShift?.note || "",
              shiftDateTime: `${handleUTCTime(
                targetShift?.startTimeUTC,
                false
              )} - ${handleUTCTime(targetShift?.endTimeUTC, true)}`,
            };
          }),
          roleId: shiftInfo?.workerRoleId || "",
          roleName: shiftInfo?.workerRoleName || "",
          locationId: shiftInfo?.locationRefVOs?.length
            ? shiftInfo?.locationRefVOs
                .map((location) => location.locationId)
                .join(",")
            : "",
          locationName: shiftInfo?.locationRefVOs?.length
            ? shiftInfo?.locationRefVOs
                .map((location) => location.locationName)
                .join(",")
            : "",
          employeeId: "",
          proposer: shiftUserProfile.fullName || "",
          proposerId: shiftUserProfile.userId || "",
          proposee: swapRequestList.map(
            (request) =>
              `${request.targetUserFirstName} ${
                request.targetUserLastName
              } (${handleUTCTime(
                request?.targetShift?.startTimeUTC,
                false
              )} - ${handleUTCTime(request?.targetShift?.endTimeUTC, true)})`
          ),
          status: data.status,
          partialShift: "",
          shiftId: data.shiftId || "",
          shiftDate: shiftInfo?.shiftDate || "",
          shiftEndTime: handleUTCTime(shiftInfo?.endTimeUTC, true),
          shiftStartTime: handleUTCTime(shiftInfo?.startTimeUTC, false),
          claimedBy: "",
          phone: shiftUserProfile.phone || "",
          nationalPhone: shiftUserProfile.nationalPhone || "",
          note: shiftInfo?.note || "",
          reason: data.reason || "",
          comment: data.reviewComment || "",
          scheduleWeek: "",
          tags: shiftInfo.tags,
        });
      }
    } finally {
    }
  };

  // get ufg shift detail
  const ufgShiftDetailFn = async (icon: string, params: NeedHelpShift) => {
    try {
      const res = await ufgShiftDetail(params.id);
      if (res.code === 200) {
        const data = res.data;

        turnDetailInfoPage(icon, {
          ...data,
          ...{
            partialShift: data?.ufgRequest.isPartial ? "Yes" : "No",
            proposer: data.username,
            proposerId: data.userId,
            departmentName: data.departmentName,
            roleName: data.workerRoleName,
            status: data.status === "NEW" ? "PENDING" : data.status,
            coverageStartTime: handleUTCTime(
              data.ufgRequest.coverageStartTimeUtc,
              false
            ),
            coverageEndTime: handleUTCTime(
              data.ufgRequest.coverageEndTimeUtc,
              true
            ),
            shiftStartTime: handleUTCTime(data.ufgRequest.startTimeUtc, false),
            shiftEndTime: handleUTCTime(data.ufgRequest.endTimeUtc, true),
            roleId: data.workerRoleId || "",
            locationName: data.locationNames || "",
          },
        });
      }
    } finally {
    }
  };

  // get call off shift detail
  const apiLoadCallOffInfo = (icon: string, params: NeedHelpShift) => {
    try {
      setReviewInfo({
        loading: true,
      });
      initCallOffShiftDetail(params.id)
        .then((res) => {
          turnDetailInfoPage(icon, {
            ...res.data,
            ...{
              departmentName: res.data.departmentName,
              proposer: `${res.data.username}`,
              proposerId: res.data.userId,
              roleName: res.data.workerRoleName,
              status: res.data.status === "NEW" ? "PENDING" : res.data.status,
              shiftStartTime: handleUTCTime(res.data.startTime, false),
              shiftEndTime: handleUTCTime(res.data.endTime, true),
              locationName: res.data.locationNames,
              shiftId: res.data.shiftId,
              roleId: res.data.workerRoleId,
            },
          });
        })
        .finally(() => {});
    } finally {
      setReviewInfo({
        loading: false,
      });
    }
  };

  // get open shift claims detail
  const openShiftClaimsDetailFn = async (
    icon: string,
    params: NeedHelpShift
  ) => {
    try {
      const res = await openShiftClaimsDetail(params.id);
      if (res.code === 200) {
        const data = res.data;
        turnDetailInfoPage(icon, {
          ...data,
          ...{
            departmentName: data.departmentName,
            claimedBy: data.claimUsername,
            roleName: data.workerRoleName,
            claimUserId: data.claimUserId,
            status: data.reviewStatus === "NEW" ? "PENDING" : data.reviewStatus,
            shiftStartTime: handleUTCTime(data.startTimeUtc, false),
            shiftEndTime: handleUTCTime(data.endTimeUtc, true),
            locationName: data.locationNames,
          },
        });
      }
    } finally {
    }
  };

  // get overtime shifts detail
  const openOvertimeShiftDetail = async (
    icon: string,
    params: NeedHelpShift
  ) => {
    try {
      const { data, code } = await getOvertimeShiftsDetail(params.id);
      if (code === 200 && data) {
        turnDetailInfoPage(icon, {
          ...data,
          employee: data.userName || "",
          proposerId: data.userId || "",
          employeeId: data.userId || "",
          roleId: data.workerRoleId || "",
          locationName: data.locationNames || "",
          roleName: data.workerRoleName || "",
          shiftEndTime: handleUTCTime(data.endTime, true),
          shiftStartTime: handleUTCTime(data.startTime, false),
          scheduleWeek: `Week ${data.weekOfYear} (${localMoment(
            data.scheduleStartDate,
            "YYYY-MM-DD"
          ).format("MM/DD/YYYY")} - ${localMoment(
            data.scheduleEndDate,
            "YYYY-MM-DD"
          ).format("MM/DD/YYYY")})`,
          employeeList: [
            {
              id: "",
              employee: "",
              phone: "",
              location: "",
              note: "",
              shiftDateTime: "",
              userId: "",
              status: false,
            },
          ],
          partialShift: "",
          shiftDate: "",
          claimedBy: "",
          comment: "",
          locationId: "",
          proposer: "",
          proposee: [""],
        });
      }
    } catch (error) {}
  };

  // handle shift swap list fn
  const handleshiftSwapsData = (list: shiftSwapResVO[]): NeedHelpShift[] => {
    return list.map((obj: shiftSwapResVO) => {
      const { shiftInfo, shiftUserProfile, swapRequestList } = obj;
      return {
        id: obj.id || "",
        departmentId: shiftInfo.departmentId || "",
        departmentName: shiftInfo.departmentName || "",
        employee: obj.shiftUserProfile.id || "",
        employeeId: obj.shiftUserProfile.userId || "",
        employeeList: swapRequestList.map((request) => {
          const {
            targetShift,
            targetUserFirstName,
            targetUserLastName,
            targetUserPhone,
            targetUserId,
          } = request;
          return {
            id: request.id || "",
            employee: `${targetUserFirstName}{" "}${targetUserLastName}`,
            userId: targetUserId || "",
            phone: targetUserPhone || "",
            location: targetShift?.locationRefVOs?.length
              ? targetShift?.locationRefVOs
                  .map((location) => location.locationName)
                  .join(",")
              : "",
            note: "",
            shiftDateTime: "",
            status: false,
          };
        }),
        roleId: shiftInfo.workerRoleId || "",
        roleName: shiftInfo.workerRoleName || "",
        locationId: "",
        locationName: "",
        proposer: `${shiftUserProfile.fullName || ""} (${handleUTCTime(
          shiftInfo?.startTimeUTC,
          false
        )} - ${handleUTCTime(shiftInfo?.endTimeUTC, true)})`,
        proposerId: shiftUserProfile.userId || "",
        proposee: swapRequestList.map(
          (request) =>
            `${request.targetUserFirstName} ${
              request.targetUserLastName
            } (${handleUTCTime(
              request?.targetShift?.startTimeUTC,
              false
            )} - ${handleUTCTime(request?.targetShift?.endTimeUTC, true)})`
        ),
        status: obj.status || "",
        partialShift: "",
        shiftId: obj.shiftId || "",
        shiftDate: shiftInfo.shiftDate || "",
        shiftEndTime: handleUTCTime(shiftInfo?.endTimeUTC, true),
        shiftStartTime: handleUTCTime(shiftInfo?.startTimeUTC, false),
        claimedBy: "",
        phone: shiftUserProfile.phone || "",
        note: shiftInfo.note || "",
        reason: obj.reason || "",
        comment: obj.reviewComment || "",
        scheduleWeek: "",
      };
    });
  };

  // handling different icon clicks
  const turnDetailInfoPage = (icon: string, data: NeedHelpShift) => {
    if (icon === "view") {
      setReviewInfo({
        visible: true,
        type: currentView,
        isView: true,
        needHelpShift: data,
      });
    } else {
      setReviewInfo({
        visible: true,
        type: currentView,
        isView: false,
        needHelpShift: data,
      });
    }
  };

  const handleOvertimeData = (list: OvertimeShiftVO[]): NeedHelpShift[] => {
    return list.map((obj) => {
      return {
        id: obj.id || "",
        departmentId: obj.departmentId || "",
        departmentName: obj.departmentName || "",
        roleId: obj.workerRoleId || "",
        roleName: obj.workerRoleName || "",
        employee: obj.userName || "",
        employeeId: obj.userId || "",
        employeeList: [
          {
            id: "",
            employee: "",
            phone: "",
            location: "",
            note: "",
            shiftDateTime: "",
            status: false,
            userId: "",
          },
        ],
        locationId: "",
        locationName: obj.locationNames || "",
        status: obj.status,
        proposer: "",
        proposee: [""],
        partialShift: "No",
        shiftId: obj.shiftId || "",
        shiftDate: "",
        shiftEndTime: handleUTCTime(obj.endTime, true),
        shiftStartTime: handleUTCTime(obj.startTime, false),
        claimedBy: "",
        phone: obj.phone || "",
        note: obj.note || "",
        reason: obj.reason || "",
        comment: "",
        scheduleWeek: `Week ${obj.weekOfYear} (${localMoment(
          obj.scheduleStartDate,
          "YYYY-MM-DD"
        ).format("MM/DD/YYYY")} - ${localMoment(
          obj.scheduleEndDate,
          "YYYY-MM-DD"
        ).format("MM/DD/YYYY")})`,

        proposerId: "",
      };
    });
  };

  const getCount = async () => {
    const { data, code } = await getNeedCoverageCount(communityId);
    if (code === 200) {
      const tabsOptionsNow = JSON.parse(JSON.stringify(tabsOptions));
      tabsOptionsNow[0].unread = data.swapsCount === 0 ? null : data.swapsCount;
      tabsOptionsNow[1].unread = data.ufgCount === 0 ? null : data.ufgCount;
      tabsOptionsNow[2].unread =
        data.callOffCount === 0 ? null : data.callOffCount;
      tabsOptionsNow[3].unread =
        data.openShiftClaimsCount === 0 ? null : data.openShiftClaimsCount;
      tabsOptionsNow[4].unread =
        data.overtimeShiftsCount === 0 ? null : data.overtimeShiftsCount;

      setTabsOptions(tabsOptionsNow);
    }
  };

  useEffect(() => {
    if (currentView === "callOffs") {
      setCurrentColum(columns_call);
    } else if (currentView === "upForGrabs") {
      setCurrentColum(columns_crabs);
    } else if (currentView === "shiftSwaps") {
      setCurrentColum(columns_swap);
    } else if (currentView === "openShiftClaims") {
      setCurrentColum(columns_claims);
    } else if (currentView === "overtimeShifts") {
      setCurrentColum(columns_overtime);
    }
    setSearchParams({
      roleId: "",
      userId: "",
      status: "",
    });
    setPagination({
      pageNum: 1,
      pageSize: 15,
      total: 0,
    });
  }, [currentView]);

  const initData = useMemo(() => {
    return () => {
      try {
        Promise.all([getCount(), getDataListFn()]);
      } finally {
      }
    };
  }, [
    communityId,
    departmentIds,
    searchParams,
    pagination.pageNum,
    pagination.pageSize,
  ]);

  useEffect(() => {
    setListDataInfo({
      data: [],
    });
    initData();
  }, [
    searchParams,
    pagination.pageNum,
    pagination.pageSize,
    communityId,
    departmentIds,
  ]);

  useEffect(() => {
    if (pagination.pageNum === 1) {
      setListDataInfo({
        data: [],
      });
      initData();
    } else {
      setPagination({
        pageNum: 1,
      });
    }
  }, [searchParams]);

  const resetComment = () => {
    clearErrors("comment");
    resetField("comment");
  };

  const checkFn = (type: TimeOffStatus) => {
    if (tableRef.current?.getSelectedRows()?.length) {
      if (type == "REJECTED") {
        setMultipleReviewDia({
          open: true,
          type: "REJECTED",
        });
      } else {
        setMultipleReviewDia({
          open: true,
          type: "APPROVED",
        });
      }
    } else {
      toast.warning("Please select at least one record.");
    }
  };

  const approveConfirmFn = async () => {
    const { type } = multipleReviewDia;
    if (comment.trim() === "" && type === "REJECTED") {
      setError("comment", {
        message: "This field is required.",
      });
      return;
    } else {
      clearErrors("comment");
    }
    try {
      setBtnLoading(true);

      const shiftId = tableRef.current
        ?.getSelectedRows()
        .map((row: any) => row?.original.shiftId) as string[];
      const { code } = await overtimeBatch({
        shiftId,
        comment,
        status: type === "REJECTED" ? "REJECT" : "APPROVED",
      });
      if (code === 200) {
        if (type === "REJECTED") {
          toast.success(MESSAGE.reject, { position: "top-center" });
        } else if (type === "APPROVED") {
          toast.success(MESSAGE.approve, { position: "top-center" });
        }
        resetComment();
        getDataListFn();
        getCount();
        setMultipleReviewDia({
          open: false,
        });
        tableRef.current?.clearSelectedRows();
      }
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <Spin className="h-full">
      <PageContainer
        contentClassName={cn(ReviewInfo.visible && "p-0")}
        className={"min-w-[1400px] relative"}
      >
        {!ReviewInfo.visible && (
          <>
            <PageTitle title="Shifts That Need Help" isClose={false} />
            <Tabs
              className="mt-[30px]"
              items={tabsOptions}
              defaultActiveKey={currentView}
              isChangeActive={false}
              onclick={(key: NeedHelpShiftTabsKey) => {
                if (canClickTab.current) {
                  if (key !== currentView) {
                    setCurrentView(key);
                  } else {
                    initData();
                  }
                }
              }}
            />

            <div className="mt-[20px]">
              <TableSearchForm
                type={currentView}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                checkFn={checkFn}
              ></TableSearchForm>
            </div>
            {/* To make the adaptiveHeight property in CustomTable refresh */}
            {currentView === "overtimeShifts" && (
              <CustomTable
                adaptive
                columns={currentColum}
                data={listDataInfo.data}
                loading={listDataInfo.loading}
                ref={tableRef}
                pagination={pagination}
                changePageNum={(pageNum) => {
                  setPagination({ pageNum });
                }}
                changePageSize={(pageSize) => {
                  const nowSize =
                    pagination.pageSize * (pagination.pageNum - 1) + 1;

                  const pageNum = Math.ceil(nowSize / pageSize);

                  setPagination({ ...pagination, pageSize, pageNum: pageNum });
                }}
                enableRowSelection={(row: any) =>
                  !isCanNotCheck(row.original.status)
                }
              />
            )}
            {currentView !== "overtimeShifts" && (
              <CustomTable
                adaptive
                columns={currentColum}
                data={listDataInfo.data}
                loading={listDataInfo.loading}
                ref={tableRef}
                pagination={pagination}
                changePageNum={(pageNum) => {
                  setPagination({ pageNum });
                }}
                changePageSize={(pageSize) => {
                  const nowSize =
                    pagination.pageSize * (pagination.pageNum - 1) + 1;

                  const pageNum = Math.ceil(nowSize / pageSize);

                  setPagination({ ...pagination, pageSize, pageNum: pageNum });
                }}
              />
            )}
          </>
        )}
        {ReviewInfo.visible && (
          <EditOrView
            type={ReviewInfo.type}
            isView={ReviewInfo.isView}
            needHelpShift={ReviewInfo.needHelpShift}
            onClose={() => {
              setReviewInfo({
                visible: false,
              });
            }}
            onSuccessful={() => {
              getDataListFn();
              getCount();
              setReviewInfo({
                visible: false,
              });
            }}
          ></EditOrView>
        )}
        <ConfirmDialog
          btnLoading={btnLoading}
          open={multipleReviewDia.open}
          onClose={() => {
            resetComment();
            setMultipleReviewDia({
              open: false,
            });
          }}
          onOk={() => {
            approveConfirmFn();
          }}
        >
          Are you sure you want to{" "}
          {multipleReviewDia.type === "REJECTED" ? "reject" : "approve"} the
          selected overtime shifts?
          <FormLabel
            label={`Please enter the ${
              multipleReviewDia.type === "REJECTED"
                ? "rejection reason"
                : "approval comment"
            }:`}
          >
            <FormItem
              name="comment"
              control={control}
              errors={errors.comment}
              render={({ field: { value, onChange } }) => (
                <Textarea
                  rows={4}
                  value={value}
                  onChange={(e) => {
                    onChange(e);
                    const value = e.target.value;
                    if (value.trim().length > 0) {
                      clearErrors("comment");
                    }
                  }}
                  placeholder={
                    multipleReviewDia.type === "REJECTED"
                      ? "Rejection Reason"
                      : "Approval Comment"
                  }
                />
              )}
            />
          </FormLabel>
        </ConfirmDialog>
      </PageContainer>
    </Spin>
  );
}
