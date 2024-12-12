import { useSetState } from "ahooks";
import { useUpdateEffect } from "ahooks";
import { addDays, differenceInMinutes, parse } from "date-fns";
import { cloneDeep, isEmpty, omitBy } from "lodash";
// import { uniq } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { locationListSearch } from "@/api/location";
import {
  joinDepartmentApi,
  scheduleTemplateShiftBatchEdit,
} from "@/api/scheduleTemplates";
import {
  ScheduleTemplateShiftCreateParams,
  TemplateShift,
} from "@/api/scheduleTemplates/types";
import { getTemplateUserListWithStatus } from "@/api/user";
import { GetUserWorkerListRoleAllReq } from "@/api/user/types";
import { workerRoleList } from "@/api/workerRole";
import CustomButton from "@/components/custom/Button";
import Dialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import Select, { OptionType } from "@/components/custom/Select";
import TimePicker from "@/components/custom/TimePicker";
import { FormItem, FormLabel } from "@/components/FormComponent";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MESSAGE } from "@/constant/message";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";
import useGlobalTime from "@/hooks/useGlobalTime";
import sortListByKey from "@/utils/sortByKey";
import { checkShiftsConflict, convert12to24 } from "@/utils/time";
import SixteenHoursIcon from "~/icons/shiftStatus/16hoursIcon.svg";
import DoubleBookedIcon from "~/icons/shiftStatus/DoubleBookedIcon.svg";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";
import TargetExceededIcon from "~/icons/shiftStatus/TargetExceededIcon.svg";

type AddShiftDialogDialogProps = {
  communityId: string;
  templateId: string;
  departmentId?: string;
  selectShiftIds: string[];
  selectShift: TemplateShift[];
  onClose: () => void;
  onSuccess?: () => void;
  onClear?: () => void;
};

const BulkEditDialog = (props: AddShiftDialogDialogProps) => {
  const {
    communityId,
    templateId,
    departmentId,
    selectShiftIds,
    selectShift,
    onClose,
    onSuccess,
    onClear,
  } = props;

  const { zoneAbbr } = useGlobalTime();

  const [chooseSelectShifts, setChooseSelectShifts] = useState<TemplateShift[]>(
    []
  );
  const [submitLoading, setSubmitLoading] = useState(false);

  const [confirmInfo, setConfirmInfo] = useSetState<{
    isShowConfirm: boolean;
    loading: boolean;
    userId: string;
  }>({
    loading: false,
    isShowConfirm: false,
    userId: "",
  });

  const [selectsInfo, setSelectsInfo] = useSetState({
    locationLoading: true,
    locationOptions: [] as OptionType[],

    roleLoading: true,
    roleOptions: [] as OptionType[],

    employeeLoading: false,
    employeeOptions: [] as OptionType[],
    employeeOriginal: [] as GetUserWorkerListRoleAllReq[],

    dayOfWeekOptions: [
      { label: "Sunday", value: 7 },
      { label: "Monday", value: 1 },
      { label: "Tuesday", value: 2 },
      { label: "Wednesday", value: 3 },
      { label: "Thursday", value: 4 },
      { label: "Friday", value: 5 },
      { label: "Saturday", value: 6 },
    ] as OptionType[],
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    trigger,
    setValue,
    getValues,
  } = useForm<ScheduleTemplateShiftCreateParams>({
    defaultValues: {
      departmentId: "",
      locationIds: [],
      workerRoleId: "",
      userId: "",
      startTime: "",
      endTime: "",
      dayOfWeek: [],
    },
  });

  const startTimeValue = watch("startTime");
  const endTimeValue = watch("endTime");
  const dayOfWeekValue = watch("dayOfWeek");
  const workerRoleIdValue = watch("workerRoleId");

  const loadGetLocationList = () => {
    locationListSearch({
      communityId,
      isEnabled: true,
      departmentIds: departmentId || "",
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

  const loadGetRoleList = () => {
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

  const { departmentIds } = useGlobalDepartment();

  const formatUserInfoString = (value: string | undefined | null) => {
    if (!value) return;
    return value.replaceAll(",", ", ");
  };

  // const initDefaultUserWorkerList = (roleId?: string) => {
  //   if (!communityId) {
  //     return;
  //   }

  //   const params = {
  //     departmentIds: departmentIds ? departmentIds[0] : "",
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

  const loadGetUserWorkerList = (roleId?: string) => {
    if (!communityId) {
      return;
    }

    const values = getValues();
    getTemplateUserListWithStatus({
      communityId,
      departmentId: departmentIds ? departmentIds[0] : "",
      workerRoleId: values.workerRoleId,
      templateId: templateId,
      searchUserQuery: {
        chooseSelectShifts: chooseSelectShifts,
        operateType: "BULK",
        intersection: true,
      },
    })
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
        data.map((item: any) => ({
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
    loadGetLocationList();
    loadGetRoleList();
    // const roleIds = uniq(selectShift.map((item) => item.workerRoleId));
    // // loadGetUserWorkerList(roleIds.join(","));
    // initDefaultUserWorkerList(roleIds.join(","));
    initUserListData(true);
  }, []);

  const initUserListData = (mustLoad?: boolean) => {
    const values = getValues();
    console.log(selectShift);
    if (
      templateId &&
      communityId &&
      departmentId &&
      selectShift != null &&
      selectShift.length > 0 &&
      (mustLoad ||
        (values.endTime && values.startTime) ||
        (values.dayOfWeek != null && values.dayOfWeek.length > 0) ||
        values.workerRoleId)
    ) {
      const newSelectShifts: TemplateShift[] = cloneDeep(selectShift);
      console.log(selectShift);
      newSelectShifts.forEach((item) => {
        if (values.endTime && values.startTime) {
          item.endTime = convert12to24(values.endTime) as string;
          item.startTime = convert12to24(values.startTime) as string;
        } else {
          item.endTime = item.planEndTime
            ? (convert12to24(item.planEndTime) as string)
            : "";
          item.startTime = item.planStartTime
            ? (convert12to24(item.planStartTime) as string)
            : "";
        }

        if (values.dayOfWeek != null && values.dayOfWeek.length > 0) {
          if (values.dayOfWeek[0]) {
            item.dayOfWeek = values.dayOfWeek[0];
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

  useUpdateEffect(() => {
    initUserListData();
  }, [endTimeValue, startTimeValue, dayOfWeekValue, workerRoleIdValue]);

  const handleCheckBeforeSave = (
    formData: ScheduleTemplateShiftCreateParams
  ) => {
    if (formData.startTime) {
      if (!formData.endTime) {
        setError("endTime", {
          type: "manual",
          message: "End time is required",
        });
        return;
      }
    }

    if (formData.endTime) {
      if (!formData.startTime) {
        setError("startTime", {
          type: "manual",
          message: "Start time is required",
        });
        return;
      }
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime === formData.endTime) {
        setError("startTime", {
          type: "manual",
          message: "Start time cannot equal end time.",
        });

        setError("endTime", {
          type: "manual",
          message: "Start time cannot equal end time.",
        });
        return;
      }
    }

    setIsSureDeleteDialog(true);
  };

  const filterEmptyFields = (obj: object) => {
    return omitBy(obj, (value) => {
      return value === "" || (Array.isArray(value) && isEmpty(value));
    });
  };

  const onSubmit = (formData: ScheduleTemplateShiftCreateParams) => {
    setIsSureDeleteDialog(false);

    const option = selectsInfo.employeeOriginal.find(
      (item) => item.userId === (formData.userId as string)
    );

    if (selectShift.length) {
      if (
        option &&
        formData.dayOfWeek &&
        formData.dayOfWeek.length > 0 &&
        formData.startTime &&
        formData.endTime
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
        shifts: TemplateShift[];
      }[] = [];

      selectShift.forEach((shift: TemplateShift) => {
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
      });

      const resultName: string[] = [];

      for (let index = 0; index < sameUserShift.length; index++) {
        const element = sameUserShift[index];
        const { shifts } = element;

        if (element.userId && element.userName) {
          if (
            formData.dayOfWeek &&
            formData.dayOfWeek.length > 0 &&
            formData.startTime &&
            formData.endTime &&
            shifts.length > 1
          ) {
            const hasSame = resultName.includes(element.userName);
            if (!hasSame) {
              resultName.push(element.userName);
            }
          }

          if (formData.startTime && formData.endTime && shifts.length > 1) {
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

          if (
            formData.dayOfWeek &&
            formData.dayOfWeek.length > 0 &&
            shifts.length > 1
          ) {
            let hasSame = false;
            for (let i = 0; i < shifts.length; i++) {
              const shift = shifts[i];
              for (let j = i + 1; j < shifts.length; j++) {
                const shift2 = shifts[j];

                hasSame = checkShiftsConflict(
                  [shift.startTime, shift.endTime],
                  [shift2.startTime, shift2.endTime]
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

    // if (option) {
    //   const hasDepartment = option.departments.find(
    //     (item) => item.deptId === departmentId
    //   );

    //   if (!hasDepartment) {
    //     setConfirmInfo({
    //       isShowConfirm: true,
    //       formData: formData,
    //     });
    //     return;
    //   } else {
    //     handleEdit(formData);
    //   }
    // } else {
    //   handleEdit(formData);
    // }
    handleEdit(formData);
  };

  const handleEdit = (formData: ScheduleTemplateShiftCreateParams) => {
    setSubmitLoading(true);
    const data = filterEmptyFields(formData);

    const submitData = selectShiftIds.map((id) => ({
      id,
      templateId,
      departmentId,
      communityId,
      ...data,
    }));

    scheduleTemplateShiftBatchEdit(submitData)
      .then(({ code }) => {
        if (code !== 200) return;

        toast.success(MESSAGE.edit, {
          position: "top-center",
        });

        onSuccess?.();

        onClear?.();

        onClose();
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  };

  const joinDepartment = async () => {
    if (confirmInfo.userId) {
      setConfirmInfo({
        loading: true,
      });
      try {
        const res = await joinDepartmentApi({
          departmentId: departmentId || "",
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
          // loadGetUserWorkerList(workerRoleIdValue as string);
          initUserListData(true);
        }
      } finally {
        setSelectsInfo({
          locationLoading: false,
        });
      }
    }
  };

  const [isSureDeleteDialog, setIsSureDeleteDialog] = useState(false);

  const getDiffTime = useMemo(() => {
    const startTime = watch("startTime");
    const endTime = watch("endTime");

    if (!startTime || !endTime) return;

    const today = new Date();
    const startDate = parse(startTime, "hh:mm a", today);
    let endDate = parse(endTime, "hh:mm a", today);

    if (endDate <= startDate) {
      endDate = addDays(endDate, 1);
    }

    const minutesDifference = differenceInMinutes(endDate, startDate);

    const hours = (minutesDifference / 60).toFixed(2);

    return { hours };
  }, [watch("startTime"), watch("endTime")]);

  return (
    <Dialog
      open
      width="517px"
      title="Bulk Edit"
      onClose={onClose}
      footer={
        <div>
          <CustomButton
            onClick={onClose}
            variant={"outline"}
            className="w-[110px]"
            disabled={submitLoading}
          >
            Cancel
          </CustomButton>

          <CustomButton
            className="w-[110px] ml-[22px]"
            disabled={submitLoading}
            onClick={handleSubmit(handleCheckBeforeSave)}
          >
            Save
          </CustomButton>
        </div>
      }
    >
      <div className="text-[#00000040] leading-[40px] mb-[15px]">
        Notes: Please type into the field(s) that you want to make updates to
        the shift data. The field(s) left blank here will not affect the shift
        data.
      </div>

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
          render={({ field: { value, onChange } }) => (
            <Select
              isLoading={selectsInfo.roleLoading}
              options={selectsInfo.roleOptions}
              value={value}
              isClearable
              onChange={(v) => {
                onChange(v);

                // if (!v) {
                //   const roleIds = uniq(
                //     selectShift.map((item) => item.workerRoleId)
                //   );
                //   loadGetUserWorkerList(roleIds.join(","));

                // } else {
                //   loadGetUserWorkerList(v);
                // }
              }}
              placeholder="Role"
            />
          )}
        />
      </FormLabel>
      <FormLabel label="Day of Week">
        <FormItem
          name="dayOfWeek"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              options={selectsInfo.dayOfWeekOptions}
              value={value[0]}
              onChange={(v) => onChange([v])}
              placeholder="Day of Week"
              isClearable
            />
          )}
        />
      </FormLabel>

      <FormLabel label={`Shift Time (${zoneAbbr})`} contentClassName="flex">
        <FormItem
          className="flex-1 mr-[20px]"
          name="startTime"
          control={control}
          errors={errors.startTime}
          render={({ field: { value, onChange } }) => (
            <TimePicker
              value={value}
              onChange={(data) => {
                onChange(data);

                trigger("endTime");
              }}
              allowClear
              placeholder="Select Start Time"
            />
          )}
        />
        <FormItem
          className="flex-1"
          name="endTime"
          control={control}
          errors={errors.endTime}
          render={({ field: { value, onChange } }) => (
            <TimePicker
              value={value}
              onChange={(data) => {
                onChange(data);

                trigger("startTime");
              }}
              placeholder="Select End Time"
              allowClear
            />
          )}
        />
        {watch("startTime") && watch("endTime") && (
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
                    (item) => item.id === departmentId
                  );

                  if (!hasDepartment) {
                    setConfirmInfo({
                      isShowConfirm: true,
                      userId: e as string,
                    });
                  }
                }
              }}
              placeholder="Employee"
            />
          )}
        />
      </FormLabel>

      <ConfirmDialog
        open={isSureDeleteDialog}
        onClose={() => {
          setIsSureDeleteDialog(false);
        }}
        onOk={handleSubmit(onSubmit)}
      >
        Are you sure to bulk edit these shifts?
      </ConfirmDialog>
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
    </Dialog>
  );
};
export default BulkEditDialog;
