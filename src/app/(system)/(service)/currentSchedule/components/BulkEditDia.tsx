import { useSetState } from "ahooks";
import { useUpdateEffect } from "ahooks";
import { cloneDeep } from "lodash";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import { scheduleShiftBatchEdit } from "@/api/currentSchedule";
import {
  ScheduleShift,
  ScheduleShiftBatchEditParams,
  ScheduleShiftCreateParams,
} from "@/api/currentSchedule/types";
import { locationListSearch } from "@/api/location";
import { joinDepartmentApi } from "@/api/scheduleTemplates";
import {
  getScheduleUserListWithStatus,
  getUserDepartmentList,
} from "@/api/user";
import { GetUserWorkerListRoleAllReq } from "@/api/user/types";
import { workerRoleList } from "@/api/workerRole";
import CustomButton from "@/components/custom/Button";
import DatePicker from "@/components/custom/DatePicker";
import Dialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import Select, { OptionType } from "@/components/custom/Select";
import TimePicker from "@/components/custom/TimePicker";
import { FormItem, FormLabel } from "@/components/FormComponent";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MESSAGE } from "@/constant/message";
import useGlobalTime from "@/hooks/useGlobalTime";
import useDepartmentStore from "@/store/useDepartmentStore";
import sortListByKey from "@/utils/sortByKey";
import { checkShiftsConflict, convert12to24 } from "@/utils/time";
import SixteenHoursIcon from "~/icons/shiftStatus/16hoursIcon.svg";
import DoubleBookedIcon from "~/icons/shiftStatus/DoubleBookedIcon.svg";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";
import TargetExceededIcon from "~/icons/shiftStatus/TargetExceededIcon.svg";

type BulkEditDiaProps = {
  communityId: string;
  departmentIds: string[];
  weeklyDate: { from: string; to: string };
  defaultPickerValue: moment.Moment | undefined;
  selectShift: ScheduleShift[];
  onClose: () => void;
  onSuccess?: (backData: any) => void;
  onClear?: (id: string) => void;
};

const BulkEditDia = (props: BulkEditDiaProps) => {
  const {
    communityId,
    departmentIds,
    weeklyDate,
    defaultPickerValue,
    onClose,
    selectShift,
    onSuccess,
  } = props;

  const { localMoment, zoneAbbr } = useGlobalTime();

  const [submitLoading, setSubmitLoading] = useState(false);

  const [selectsInfo, setSelectsInfo] = useSetState({
    departmentLoading: false,
    departmentOptions: [] as OptionType[],

    locationLoading: false,
    locationOptions: [] as OptionType[],

    roleLoading: false,
    roleOptions: [] as OptionType[],

    employeeLoading: false,
    employeeOptions: [] as OptionType[],

    employeeOriginal: [] as GetUserWorkerListRoleAllReq[],
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
    setError,
    getValues,
  } = useForm<Partial<ScheduleShiftCreateParams>>({
    defaultValues: {
      scheduleId: null,
      departmentId: "",
      locationIds: [],
      workerRoleId: "",
      userId: "",
      shiftStartTime: "",
      shiftEndTime: "",
      shiftDate: [],
      note: "",
    },
  });

  const [chooseSelectShifts, setChooseSelectShifts] = useState<ScheduleShift[]>(
    []
  );
  const startTimeValue = watch("shiftStartTime");
  const endTimeValue = watch("shiftEndTime");
  const shiftDateValue = watch("shiftDate");
  const workerRoleIdValue = watch("workerRoleId");
  const departmentIdForm = watch("departmentId");

  const loadGetDepartmentList = () => {
    getUserDepartmentList({ communityId })
      .then(({ code, data }) => {
        if (code !== 200) return;

        setSelectsInfo({
          departmentOptions: data.map((item) => ({
            label: item.name,
            value: item.id,
          })),
        });
      })
      .finally(() => {
        setSelectsInfo({
          departmentLoading: false,
        });
      });
  };

  const loadGetLocationList = (departmentId: string) => {
    setSelectsInfo({
      locationLoading: true,
    });

    locationListSearch({
      communityId,
      isEnabled: true,
      departmentIds: departmentId,
    })
      .then(({ code, data }) => {
        if (code !== 200) return;

        setSelectsInfo({
          locationOptions: (data as any[]).map((item) => ({
            label: item.name,
            value: item.id,
          })),
        });
      })
      .finally(() =>
        setSelectsInfo({
          locationLoading: false,
        })
      );
  };

  const loadGetRoleList = (departmentId: string) => {
    setSelectsInfo({
      roleLoading: true,
    });

    workerRoleList(communityId, true, departmentId)
      .then(({ code, data }) => {
        if (code !== 200) return;

        setSelectsInfo({
          roleOptions: data.map((item) => ({
            label: item.name,
            value: item.id,
          })),
        });
      })
      .finally(() =>
        setSelectsInfo({
          roleLoading: false,
        })
      );
  };
  const { department } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const formatUserInfoString = (value: string | undefined | null) => {
    if (!value) return;
    return value.replaceAll(",", ", ");
  };

  // const pathname = usePathname();
  // const initDefaultUserWorkerList = (roleId?: string) => {
  //   if (!communityId) {
  //     return;
  //   }

  //   const params = {
  //     departmentIds: departmentIdForm ?? "",
  //     communityId,
  //     roleId,
  //     intersection: true,
  //   };
  //   getUserWorkerListRoleAll({ ...params })
  //     .then(({ code, data }) => {
  //       if (code !== 200) return;
  //       initUserSelector(data);
  //     })
  //     .finally(() =>
  //       setSelectsInfo({
  //         employeeLoading: false,
  //       })
  //     );
  // };

  const loadGetUserWorkerList = () => {
    if (!communityId) {
      return;
    }
    const values = getValues();
    const params = {
      scheduleId: selectShift[0].scheduleId,
      communityId,
      departmentId: selectShift[0].departmentId,
      workerRoleIds: values ? values.workerRoleId : "",
      searchUserQuery: {
        chooseSelectShifts: chooseSelectShifts,
        operateType: "BULK",
        intersection: true,
      },
    };

    getScheduleUserListWithStatus({ ...params })
      .then(({ code, data }) => {
        if (code !== 200) return;
        initUserSelector(data);
      })
      .finally(() =>
        setSelectsInfo({
          employeeLoading: false,
        })
      );
  };

  const initUserSelector = (data: GetUserWorkerListRoleAllReq[]) => {
    setSelectsInfo({
      employeeOptions: sortListByKey(
        data.map((item) => ({
          labelSort: `${item.firstName} ${item.lastName}`,
          value: item.userId,
          label: (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  className="w-full flex justify-start"
                >
                  <div className="w-full flex justify-between">
                    <div>
                      {item.firstName} {item.lastName}
                    </div>

                    <div className="flex items-center">
                      {item.repeat && (
                        <DoubleBookedIcon
                          width="16px"
                          height="16px"
                          className="mr-[7px]"
                        ></DoubleBookedIcon>
                      )}
                      {item.moreThan16Hours && (
                        <SixteenHoursIcon
                          width="16px"
                          height="16px"
                          className="mr-[7px]"
                        ></SixteenHoursIcon>
                      )}
                      {item.moreThanTargetHoursTag && (
                        <TargetExceededIcon
                          width="16px"
                          height="16px"
                          className="mr-[7px]"
                        ></TargetExceededIcon>
                      )}
                      {item.moreThan40HoursTag && (
                        <OvertimeIcon
                          width="16px"
                          height="16px"
                          className="mr-[7px]"
                        ></OvertimeIcon>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>

                {item.userPreference ? (
                  <TooltipContent>
                    <div className="w-auto max-w-[90vw]">
                      <p>Employee Preference</p>
                      <p>
                        Time of Day:{" "}
                        {formatUserInfoString(
                          item.userPreference?.shiftPreferenceTime
                        )}
                      </p>
                      <p>
                        Location:{" "}
                        {formatUserInfoString(
                          item.userPreference?.locationNames
                        )}
                      </p>
                    </div>
                  </TooltipContent>
                ) : null}
              </Tooltip>
            </TooltipProvider>
          ),
        })),
        "labelSort"
      ),
    });
    setSelectsInfo({
      employeeOriginal: data,
    });
    const userId = getValues("userId");
    const isExist = data.find((item) => item.userId === userId);
    if (!isExist) {
      setValue("userId", "");
    }
  };

  useEffect(() => {
    // const roles = uniq(selectShift.map((item) => item.workerRoleId));
    // // loadGetUserWorkerList(roles.join(","));
    // initDefaultUserWorkerList(roles.join(","));
    initUserListData(true);
  }, [department]);

  useEffect(() => {
    if (departmentIds) {
    }
    if (communityId) {
      if (selectShift.length) {
        const shift = selectShift[0];
        setValue("departmentId", shift?.departmentId);
        shift?.departmentId && loadGetRoleList(shift?.departmentId);
        shift?.departmentId && loadGetLocationList(shift?.departmentId);
      }

      loadGetDepartmentList();
      // const roles = uniq(selectShift.map((item) => item.workerRoleId));
      // // loadGetUserWorkerList(roles.join(","));
      // initDefaultUserWorkerList(roles.join(","));
      initUserListData(true);
    }
  }, [communityId]);

  useUpdateEffect(() => {
    initUserListData();
  }, [
    endTimeValue,
    startTimeValue,
    shiftDateValue,
    workerRoleIdValue,
    departmentIdForm,
  ]);

  const initUserListData = (mustLoad?: boolean) => {
    const values = getValues();
    if (
      // values.scheduleId &&
      communityId &&
      selectShift != null &&
      selectShift.length > 0 &&
      (mustLoad ||
        (values.shiftStartTime && values.shiftEndTime) ||
        (values.shiftDate != null && values.shiftDate.length > 0) ||
        values.workerRoleId)
    ) {
      const newSelectShifts: ScheduleShift[] = cloneDeep(selectShift);
      newSelectShifts.forEach((item) => {
        if (values.shiftEndTime && values.shiftStartTime) {
          item.shiftEndTime = convert12to24(values.shiftEndTime) as string;
          item.shiftStartTime = convert12to24(values.shiftStartTime) as string;
        } else {
          item.shiftEndTime = convert12to24(item.shiftEndTime) as string;
          item.shiftStartTime = convert12to24(item.shiftStartTime) as string;
        }

        if (values.shiftDate != null && values.shiftDate.length > 0) {
          if (values.shiftDate[0]) {
            item.shiftDate = values.shiftDate[0];
          }
        }

        if (values.workerRoleId) {
          item.workerRoleId = values.workerRoleId;
        }
      });

      setChooseSelectShifts(newSelectShifts);
    }
  };
  useUpdateEffect(() => {
    loadGetUserWorkerList();
  }, [chooseSelectShifts]);

  const handleCreate = (
    formData: Partial<ScheduleShiftCreateParams>,
    isConfirm: boolean = false
  ) => {
    setSubmitLoading(true);
    if (isConfirm) {
      setPublishErrorConfirm({
        loading: true,
      });
    }
    let params: ScheduleShiftBatchEditParams = {
      communityId: communityId,
      scheduleId: selectShift[0].scheduleId,
    } as ScheduleShiftBatchEditParams;
    const {
      locationIds,
      workerRoleId,
      userId,
      shiftStartTime,
      shiftEndTime,
      shiftDate,
      note,
    } = formData;

    params.ids = selectShift.map((item) => item.id as string);

    if (locationIds && locationIds.length) {
      params.locationIds = locationIds;
    }

    if (workerRoleId) {
      params.workerRoleId = workerRoleId;
    }

    if (userId) {
      params.userId = userId;
    }

    if (shiftStartTime) {
      params.shiftStartTime = shiftStartTime;
    }

    if (shiftEndTime) {
      params.shiftEndTime = shiftEndTime;
    }

    if (shiftDate && shiftDate.length) {
      params.shiftDate = shiftDate[0];
    }

    if (note) {
      params.note = note;
    }

    if (isConfirm) {
      params.confirmPublish = true;
    }

    scheduleShiftBatchEdit(params)
      .then(({ code, data }) => {
        if (code !== 200) return;

        if (data.isSuccess) {
          toast.success(MESSAGE.save, {
            position: "top-center",
          });

          onClose();

          onSuccess?.(null);

          if (isConfirm) {
            setPublishErrorConfirm({
              loading: false,
              visible: false,
              validateMsg: [],
              data: null,
            });
          }
        } else {
          setPublishErrorConfirm({
            visible: true,
            loading: false,
            validateMsg: data.validateMsg,
            data: params,
          });
        }
      })
      .finally(() => {
        setSubmitLoading(false);
        if (isConfirm) {
          setPublishErrorConfirm({
            loading: false,
          });
        }
      });
  };

  const onSubmit = (formData: Partial<ScheduleShiftCreateParams>) => {
    const { shiftStartTime, shiftEndTime, shiftDate, userId } = formData;

    if (shiftStartTime === shiftEndTime && shiftStartTime && shiftEndTime) {
      setError("shiftStartTime", {
        type: "manual",
        message: "Start time cannot equal end time",
      });

      setError("shiftEndTime", {
        type: "manual",
        message: "Start time cannot equal end time",
      });
      return;
    }

    const option = selectsInfo.employeeOriginal.find(
      (item) => item.userId === (userId as string)
    );

    if (selectShift.length) {
      if (
        option &&
        shiftDate &&
        shiftDate.length > 0 &&
        shiftStartTime &&
        shiftEndTime &&
        selectShift.length > 1
      ) {
        return toast.error(
          `With this update, ${option.firstName} ${option.lastName} will have overlapping working times. Please adjust.`,
          {
            position: "top-center",
          }
        );
      }

      const sameUserShift: {
        userId: string;
        userName: string;
        shifts: ScheduleShift[];
      }[] = [];

      const hasSameTimeShift: string[] = [];

      selectShift.forEach((shift: ScheduleShift) => {
        const hasSameUser = sameUserShift.find(
          (item) => item.userId === shift.userId
        );

        if (!hasSameUser) {
          sameUserShift.push({
            userId: shift.userId,
            userName: shift.userName,
            shifts: [shift],
          });
        } else {
          hasSameUser.shifts.push(shift);
        }

        if (
          (shift.shiftStartTime === shiftEndTime && shiftStartTime === "") ||
          (shift.shiftEndTime === shiftStartTime && shiftEndTime === "")
        ) {
          hasSameTimeShift.push(shift.userName);
        }
      });

      if (hasSameTimeShift.length > 0) {
        return toast.error(`Start time cannot equal end time`, {
          position: "top-center",
        });
      }

      const resultName: string[] = [];

      for (let index = 0; index < sameUserShift.length; index++) {
        const element = sameUserShift[index];
        const { shifts } = element;

        if (element.userId && element.userName) {
          if (
            shiftDate &&
            shiftDate.length > 0 &&
            shiftStartTime &&
            shiftEndTime &&
            shifts.length > 1
          ) {
            const hasSame = resultName.includes(element.userName);
            if (!hasSame) {
              resultName.push(element.userName);
            }
          }

          if (shiftStartTime && shiftEndTime && shifts.length > 1) {
            const sameDayOfWeek: number[] = [];
            shifts.forEach((shift) => {
              if (!sameDayOfWeek.includes(shift.dayOfWeek)) {
                sameDayOfWeek.push(shift.dayOfWeek);
              }
            });
            if (sameDayOfWeek.length < shifts.length) {
              if (!resultName.includes(element.userName)) {
                resultName.push(element.userName);
              }
            }
          }

          if (shiftDate && shiftDate.length > 0 && shifts.length > 1) {
            let hasSame = false;
            for (let i = 0; i < shifts.length; i++) {
              const shift = shifts[i];
              for (let j = i + 1; j < shifts.length; j++) {
                const shift2 = shifts[j];

                hasSame = checkShiftsConflict(
                  [shift.shiftStartTime, shift.shiftEndTime],
                  [shift2.shiftStartTime, shift2.shiftEndTime]
                );
              }
            }
            if (hasSame) {
              if (!resultName.includes(element.userName)) {
                resultName.push(element.userName);
              }
            }
          }
        }
      }

      if (resultName.length > 0) {
        return toast.error(
          `With this update, ${resultName.join(
            ","
          )} will have overlapping working times. Please adjust.`,
          {
            position: "top-center",
          }
        );
      }
    }

    handleCreate(formData);
  };

  const handleDepartmentChange = (departmentId: string) => {
    setValue("locationIds", []);
    setValue("workerRoleId", "");
    loadGetLocationList(departmentId);
    loadGetRoleList(departmentId);
  };

  const handleRoleChange = (roleId: string) => {
    if (!roleId) {
      // const roles = uniq(selectShift.map((item) => item.workerRoleId));
      // loadGetUserWorkerList(roles.join(","));
    } else {
      // loadGetUserWorkerList(roleId);
      initUserListData(true);
    }
  };

  const getDiffTime = useMemo(() => {
    const startTime = watch("shiftStartTime");
    const endTime = watch("shiftEndTime");

    if (!startTime || !endTime) return;

    const startDate = localMoment(startTime, "hh:mm A");
    let endDate = localMoment(endTime, "hh:mm A");

    if (endDate.isSameOrBefore(startDate)) {
      endDate = endDate.add(1, "day");
    }

    const minutesDifference = endDate.diff(startDate, "minutes");

    const hours = (minutesDifference / 60).toFixed(2);

    return { hours };
  }, [watch("shiftStartTime"), watch("shiftEndTime")]);

  const [confirmInfo, setConfirmInfo] = useSetState<{
    isShowConfirm: boolean;
    loading: boolean;
    userId: string;
  }>({
    loading: false,
    userId: "",
    isShowConfirm: false,
  });

  const joinDepartment = async () => {
    if (confirmInfo.userId) {
      setConfirmInfo({
        loading: true,
      });
      try {
        const res = await joinDepartmentApi({
          departmentId: departmentIdForm ? departmentIdForm : "",
          userId: confirmInfo.userId,
          communityId,
        });
        if (res.code === 200) {
          setConfirmInfo({
            isShowConfirm: false,
            loading: false,
          });
          toast.success(MESSAGE.assign, {
            position: "top-center",
          });
          // loadGetUserWorkerList(getValues("workerRoleId"));
          initUserListData(true);
        }
      } finally {
        setConfirmInfo({
          isShowConfirm: false,
          loading: false,
          userId: "",
        });
      }
    }
  };

  const [publishErrorConfirm, setPublishErrorConfirm] = useSetState({
    visible: false,
    loading: false,
    validateMsg: [] as string[],
    data: null as null | ScheduleShiftBatchEditParams,
  });

  return (
    <Dialog
      open
      width="517px"
      title={"Bulk Edit"}
      onClose={onClose}
      contentWrapperClassName="pr-1"
    >
      <div className="overflow-y-auto overflow-x-hidden w-full max-h-[calc(100vh-180px)] pr-3 pb-4">
        <div className="text-[#00000040] leading-[40px] mb-[15px]">
          Notes: Please type into the field(s) that you want to make updates to
          the shift data. The field(s) left blank here will not affect the shift
          data.
        </div>
        <FormLabel label="Department">
          <FormItem
            name="departmentId"
            control={control}
            errors={errors.departmentId}
            render={({ field: { value, onChange } }) => (
              <Select
                isDisabled
                isLoading={selectsInfo.departmentLoading}
                options={selectsInfo.departmentOptions}
                value={value}
                onChange={(newValue) => {
                  onChange(newValue);
                  if (newValue) handleDepartmentChange(newValue);
                  const option = selectsInfo.employeeOriginal.find(
                    (item) => item.userId === (getValues("userId") as string)
                  );

                  if (option) {
                    const hasDepartment = option.departments.find(
                      (item) => item.id === newValue
                    );

                    if (!hasDepartment && newValue) {
                      setConfirmInfo({
                        isShowConfirm: true,
                        userId: getValues("userId") as string,
                      });
                    }
                  }
                }}
                placeholder="Department"
              />
            )}
          />
        </FormLabel>

        <FormLabel label="Location">
          <FormItem
            name="locationIds"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                isLoading={selectsInfo.locationLoading}
                options={selectsInfo.locationOptions}
                {...field}
                placeholder="Location"
              />
            )}
          />
        </FormLabel>

        <FormLabel label="Role">
          <FormItem
            name="workerRoleId"
            control={control}
            errors={errors.workerRoleId}
            render={({ field: { value, onChange } }) => (
              <Select
                isClearable
                isLoading={selectsInfo.roleLoading}
                options={selectsInfo.roleOptions}
                value={value}
                onChange={(newValue) => {
                  onChange(newValue);
                  handleRoleChange(newValue);
                }}
                placeholder="Role"
              />
            )}
          />
        </FormLabel>

        {/* DatePicker */}
        <FormLabel label={`Shift Date (${zoneAbbr})`}>
          <FormItem
            name="shiftDate"
            control={control}
            errors={errors.shiftDate}
            render={({ field: { value, onChange } }) => {
              return (
                <DatePicker
                  value={value ? value[0] : undefined}
                  defaultPickerValue={defaultPickerValue}
                  onChange={(value) => {
                    onChange(value === "" ? undefined : [value]);
                  }}
                  disabledDate={(date) => {
                    let start = date.isSameOrAfter(localMoment(), "day");
                    if (
                      localMoment().isBefore(
                        localMoment(weeklyDate.from, "MM/DD/YYYY"),
                        "day"
                      )
                    ) {
                      start = date.isSameOrAfter(
                        localMoment(weeklyDate.from, "MM/DD/YYYY"),
                        "day"
                      );
                    }
                    let end = date.isSameOrBefore(
                      localMoment(weeklyDate.to, "MM/DD/YYYY"),
                      "day"
                    );
                    if (start && end) {
                      return false;
                    }

                    return true;
                  }}
                  placeholder="Select Date"
                  allowClear
                />
              );
            }}
          />
        </FormLabel>

        <FormLabel label={`Shift Time (${zoneAbbr})`} contentClassName="flex">
          <FormItem
            className="flex-1 mr-[20px]"
            name="shiftStartTime"
            control={control}
            errors={errors.shiftStartTime}
            render={({ field: { value, onChange } }) => (
              <TimePicker
                value={value}
                allowClear
                onChange={(data) => {
                  onChange(data);
                }}
                placeholder="Select Start Time"
              />
            )}
          />

          <FormItem
            className="flex-1"
            name="shiftEndTime"
            control={control}
            errors={errors.shiftEndTime}
            render={({ field: { value, onChange } }) => (
              <TimePicker
                value={value}
                allowClear
                onChange={(data) => {
                  onChange(data);
                }}
                placeholder="Select End Time"
              />
            )}
          />

          {watch("shiftStartTime") && watch("shiftEndTime") && (
            <>
              <div className="flex justify-center pt-[10px] pl-[10px] w-[50px]">
                {getDiffTime?.hours}h
              </div>
            </>
          )}
        </FormLabel>
        <FormLabel label="Employee">
          <FormItem
            name="userId"
            control={control}
            render={({ field }) => (
              <Select
                isClearable
                isLoading={selectsInfo.employeeLoading}
                options={selectsInfo.employeeOptions}
                {...field}
                placeholder="Employee"
                menuPlacement={
                  selectsInfo.employeeOptions.length >= 6 ? "top" : "bottom"
                }
                filterOption={(option: any, input) => {
                  if (option && option?.data?.labelSort) {
                    return option.data.labelSort
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }
                  return true;
                }}
                onChange={(e) => {
                  field.onChange(e);
                  const option = selectsInfo.employeeOriginal.find(
                    (item) => item.userId === (e as string)
                  );

                  if (option) {
                    const hasDepartment = option.departments.find(
                      (item) => item.id === getValues("departmentId")
                    );

                    if (!hasDepartment && getValues("departmentId")) {
                      setConfirmInfo({
                        isShowConfirm: true,
                        userId: e as string,
                      });
                    }
                  }
                }}
              />
            )}
          />
        </FormLabel>

        <FormLabel label="Notes">
          <FormItem
            name="note"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Textarea value={value} onChange={onChange} placeholder="Notes" />
            )}
          />
        </FormLabel>
        <div className="w-full flex justify-end">
          <CustomButton
            onClick={onClose}
            variant={"outline"}
            className="w-[110px]"
            disabled={submitLoading}
          >
            Cancel
          </CustomButton>

          <CustomButton
            loading={submitLoading}
            className="w-[110px] ml-[22px]"
            onClick={handleSubmit((data) => {
              onSubmit(data);
            })}
          >
            Save
          </CustomButton>
        </div>
      </div>

      <ConfirmDialog
        open={confirmInfo.isShowConfirm}
        loading={confirmInfo.loading}
        onClose={() => {
          setConfirmInfo({
            isShowConfirm: false,
            userId: "",
          });
        }}
        onOk={() => {
          joinDepartment();
        }}
      >
        Do you want to assign this employee to this department?
      </ConfirmDialog>
      {publishErrorConfirm.visible && (
        <ConfirmDialog
          open={publishErrorConfirm.visible}
          btnLoading={publishErrorConfirm.loading}
          width="560px"
          onClose={() => {
            setPublishErrorConfirm({
              visible: false,
              loading: false,
              validateMsg: [],
            });
          }}
          onOk={() => {
            if (publishErrorConfirm.data) {
              handleCreate(getValues(), true);
            }
          }}
        >
          <div>
            {publishErrorConfirm.validateMsg.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
        </ConfirmDialog>
      )}
    </Dialog>
  );
};
export default BulkEditDia;
