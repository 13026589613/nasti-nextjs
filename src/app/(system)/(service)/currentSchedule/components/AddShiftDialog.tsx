import { useSetState } from "ahooks";
import { useUpdateEffect } from "ahooks";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  getScheduleInfo,
  scheduleShiftCreate,
  scheduleShiftDelete,
  scheduleShiftEdit,
  scheduleShiftInfo,
  unPublishShift,
} from "@/api/currentSchedule";
import {
  AddShiftDialogScheduleInfo,
  ScheduleShiftCreateParams,
} from "@/api/currentSchedule/types";
import { locationListSearch } from "@/api/location";
import { joinDepartmentApi } from "@/api/scheduleTemplates";
import {
  getScheduleUserListWithStatus,
  getUserDepartmentList,
  getUserWorkerListRoleAll,
} from "@/api/user";
import { GetUserWorkerListRoleAllReq } from "@/api/user/types";
import { workerRoleList } from "@/api/workerRole";
import CustomButton from "@/components/custom/Button";
import DatePicker from "@/components/custom/DatePicker";
import Dialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomInput from "@/components/custom/Input";
import MultipleDatePicker from "@/components/custom/MultipleDatePicker";
import Select, { OptionType } from "@/components/custom/Select";
import TimePicker from "@/components/custom/TimePicker";
import { FormItem, FormLabel } from "@/components/FormComponent";
import { getStartAndEndOfWeek } from "@/components/schedules/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MESSAGE } from "@/constant/message";
import useGlobalTime from "@/hooks/useGlobalTime";
import sortListByKey from "@/utils/sortByKey";
import { convert12to24 } from "@/utils/time";
import SixteenHoursIcon from "~/icons/shiftStatus/16hoursIcon.svg";
import DoubleBookedIcon from "~/icons/shiftStatus/DoubleBookedIcon.svg";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";
import TargetExceededIcon from "~/icons/shiftStatus/TargetExceededIcon.svg";

// import { ShiftInfo } from "../types";
import ShiftHistory from "./ShiftHistory";

type AddShiftDialogDialogProps = {
  communityId: string;
  departmentId?: string;
  shiftId?: string;
  scheduleId?: string;
  shiftDate?: string;
  workerRoleId?: string;
  userId?: string;
  weeklyDate: { from: string; to: string };
  defaultPickerValue: moment.Moment | undefined;
  onClose: () => void;
  onSuccess?: (departmentId: string) => void;
  onClear?: (id: string) => void;
};

const AddShiftDialog = (props: AddShiftDialogDialogProps) => {
  const {
    communityId,
    shiftId = "",
    shiftDate,
    departmentId,
    workerRoleId,
    userId,
    weeklyDate,
    defaultPickerValue,
    onClose,
    onSuccess,
  } = props;

  const [scheduleId, setScheduleId] = useState<string>("");

  const { localMoment, UTCMoment, zoneAbbr } = useGlobalTime();
  const [dialogLoading, setDialogLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useSetState({
    saveLoading: false,
    deleteLoading: false,
    publishLoading: false,
  });

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
  } = useForm<ScheduleShiftCreateParams>({
    defaultValues: {
      scheduleId: null,
      departmentId: "",
      departmentName: "",
      locationIds: [],
      locationNames: [],
      workerRoleId: "",
      workerRoleName: "",
      userId: "",
      shiftStartTime: "",
      shiftEndTime: "",
      shiftDate: [],
      note: "",
      quantity: "1",
    },
  });

  const startTimeValue = watch("shiftStartTime");
  const endTimeValue = watch("shiftEndTime");
  const workerRoleIdValue = watch("workerRoleId");

  const shiftUserId = watch("userId");
  const shiftDateForm = watch("shiftDate");
  const departmentIdForm = watch("departmentId");
  const [isShiftPublish, setIsShiftPublish] = useState(false);
  const [hasDraftSchedule, setHasDraftSchedule] = useState(true);

  const [scheduleInfo, setScheduleInfo] = useState<
    AddShiftDialogScheduleInfo[]
  >([]);

  const checkSchedulePublished = async () => {
    let showPublish = true;
    for (let index = 0; index < shiftDateForm.length; index++) {
      const date = shiftDateForm[index];
      const { startTime, endTime } = getStartAndEndOfWeek(date, "MM/DD/YYYY");
      const schedule = scheduleInfo.find(
        (item) =>
          item.weekStartDate === startTime &&
          item.weekEndDate === endTime &&
          item.departmentId === departmentIdForm
      );

      if (!schedule) {
        const isPublished = await getIfShiftPublished(date);

        setScheduleInfo([
          ...scheduleInfo,
          {
            departmentId: departmentIdForm,
            weekStartDate: startTime,
            weekEndDate: endTime,
            isPublished: isPublished,
          },
        ]);

        if (!isPublished) {
          showPublish = false;
        }
      } else {
        if (!schedule.isPublished) {
          showPublish = false;
        }
      }

      if (localMoment(date, "MM/DD/YYYY").isBefore(localMoment(), "day")) {
        showPublish = false;
      }
    }

    setHasDraftSchedule(!showPublish);
  };

  const getIfShiftPublished = async (date: string) => {
    const res = await getScheduleInfo({
      communityId: communityId,
      departmentId: departmentIdForm,
      date: date,
    });
    if (res.code === 200) {
      if (res.data) {
        return res.data.isPublished;
      } else {
        return false;
      }
    }
    return false;
  };

  useUpdateEffect(() => {
    const values = getValues();
    if (
      // scheduleId &&
      communityId &&
      values.departmentId &&
      values.shiftStartTime &&
      values.shiftEndTime &&
      values.shiftDate != null &&
      values.shiftDate.length > 0
    ) {
      loadGetUserWorkerList();
    }
  }, [
    endTimeValue,
    startTimeValue,
    shiftDateForm,
    workerRoleIdValue,
    departmentIdForm,
  ]);

  useEffect(() => {
    if (shiftDateForm.length && departmentIdForm) {
      checkSchedulePublished();
    }
  }, [shiftDateForm, departmentIdForm]);

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

        if (departmentId) {
          setValue("departmentId", departmentId);
          loadGetLocationList(departmentId);
          loadGetRoleList(departmentId);
        }
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
  const formatUserInfoString = (value: string | undefined | null) => {
    if (!value) return;
    return value.replaceAll(",", ", ");
  };
  // const pathname = usePathname();
  const initDefaultUserWorkerList = (roleId?: string) => {
    if (!communityId) {
      return;
    }

    const params = {
      scheduleId,
      communityId,
      departmentIds: departmentIdForm,
      roleId,
    };
    getUserWorkerListRoleAll({ ...params })
      .then(({ code, data }) => {
        initUserSelector(code, data);
      })
      .finally(() =>
        setSelectsInfo({
          employeeLoading: false,
        })
      );
  };

  const loadGetUserWorkerList = (roleId?: string) => {
    if (!communityId) {
      return;
    }

    const values = getValues();
    const params = {
      scheduleId,
      communityId,
      departmentId: values ? values.departmentId : "",
      workerRoleIds: values ? values.workerRoleId : "",
      searchUserQuery: {
        shiftId: shiftId,
        shiftStartTime: values ? convert12to24(values.shiftStartTime) : "",
        shiftEndTime: values ? convert12to24(values.shiftEndTime) : "",
        shiftDate: values && values.shiftDate ? values.shiftDate : null,
        chooseSelectShifts: [],
        operateType: shiftId ? "UPDATE" : "INSERT",
        // intersection: false,
      },
    };
    getScheduleUserListWithStatus({ ...params })
      .then(({ code, data }) => {
        initUserSelector(code, data);
      })
      .finally(() =>
        setSelectsInfo({
          employeeLoading: false,
        })
      );
  };

  const initUserSelector = (
    code: number,
    data: GetUserWorkerListRoleAllReq[]
  ) => {
    if (code !== 200) return;
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

  const [isShowUnpublishConfirm, setIsShowUnpublishConfirm] = useState(false);

  const loadGetShiftInfo = () => {
    setDialogLoading(true);

    scheduleShiftInfo(shiftId)
      .then(({ code, data }) => {
        if (code !== 200) return;
        const {
          departmentId,
          departmentName,
          locationRefVOs,
          workerRoleId,
          workerRoleName,
          userId,
          startTimeUTC,
          endTimeUTC,
          note,
          tags,
          isPublished,
          scheduleId,
        } = data;

        let shiftStartTime = UTCMoment(startTimeUTC).format("hh:mm A");
        let shiftEndTime = UTCMoment(endTimeUTC).format("hh:mm A");
        let shiftDate = UTCMoment(startTimeUTC).format("MM/DD/YYYY");

        setIsShiftPublish(isPublished);

        if (tags && tags.length > 0) {
          if (!isPublished && tags.includes(4)) {
            setIsShiftPublish(true);
          }
        }

        setIsShowUnpublishConfirm(isPublished);

        if (departmentId) {
          setValue("departmentId", departmentId);
          loadGetLocationList(departmentId);
          loadGetRoleList(departmentId);
        }
        if (departmentName) {
          setValue("departmentName", departmentName);
        }
        if (workerRoleName) {
          setValue("workerRoleName", workerRoleName);
        }

        if (locationRefVOs?.length) {
          setValue(
            "locationIds",
            locationRefVOs.map((item) => item.locationId)
          );
          setValue(
            "locationNames",
            locationRefVOs.map((item) => item.locationName)
          );
        }

        if (workerRoleId) {
          setValue("workerRoleId", workerRoleId);
          // loadGetUserWorkerList(workerRoleId);
        } else {
          // loadGetUserWorkerList();
          initDefaultUserWorkerList();
        }

        if (userId) {
          setValue("userId", userId);
        }

        if (shiftStartTime && shiftEndTime) {
          setValue("shiftStartTime", shiftStartTime);
          setValue("shiftEndTime", shiftEndTime);
        }

        if (shiftDate?.length) {
          setValue("shiftDate", [shiftDate]);
        }

        if (note) {
          setValue("note", note);
        }

        if (scheduleId) {
          setScheduleId(scheduleId);
        }
      })
      .finally(() => {
        setDialogLoading(false);
      });
  };

  useEffect(() => {
    loadGetDepartmentList();

    if (shiftId) {
      loadGetShiftInfo();
    }
    if (shiftDate?.length) {
      setValue("shiftDate", [shiftDate]);
    }

    if (workerRoleId) {
      setValue("workerRoleId", workerRoleId);
      // loadGetUserWorkerList(workerRoleId);
    } else if (!shiftId) {
      // loadGetUserWorkerList();
      initDefaultUserWorkerList();
    }

    if (userId) {
      setValue("userId", userId);
    }
  }, [communityId]);

  const handleEdit = (
    formData: ScheduleShiftCreateParams,
    isPublish: boolean,
    isConfirm: boolean = false
  ) => {
    if (isPublish) {
      setSubmitLoading({
        publishLoading: true,
      });
    } else {
      setSubmitLoading({
        saveLoading: true,
      });
    }
    if (isConfirm) {
      setPublishErrorConfirm({
        loading: true,
      });
    }
    let params = {
      ...formData,
      communityId,
      id: shiftId,
    };

    if (isPublish) {
      params.published = true;
    }

    if (isConfirm) {
      params.confirmPublish = true;
    }

    scheduleShiftEdit(params)
      .then(({ code, data }) => {
        if (code !== 200) return;

        if (data.isSuccess) {
          if (isPublish) {
            toast.success(MESSAGE.editAndPub, {
              position: "top-center",
            });
          } else {
            toast.success(MESSAGE.edit, {
              position: "top-center",
            });
          }

          onClose();

          onSuccess?.(formData.departmentId);
        } else {
          setPublishErrorConfirm({
            visible: true,
            isEdit: true,
            validateMsg: data.validateMsg,
          });
        }
      })
      .finally(() => {
        if (isPublish) {
          setSubmitLoading({
            publishLoading: false,
          });
        } else {
          setSubmitLoading({
            saveLoading: false,
          });
        }
        if (isConfirm) {
          setPublishErrorConfirm({
            loading: false,
          });
        }
      });
  };

  const handleCreate = (
    formData: ScheduleShiftCreateParams,
    isPublish: boolean,
    isConfirm: boolean = false
  ) => {
    if (isPublish) {
      setSubmitLoading({
        publishLoading: true,
      });
    } else {
      setSubmitLoading({
        saveLoading: true,
      });
    }

    if (isConfirm) {
      setPublishErrorConfirm({
        loading: true,
      });
    }

    let params = {
      ...formData,
      communityId,
    };

    if (isPublish) {
      params.published = true;
    }

    if (isConfirm) {
      params.confirmPublish = true;
    }

    scheduleShiftCreate(params)
      .then(({ code, data }) => {
        if (code !== 200) return;

        if (data.isSuccess) {
          if (isPublish) {
            toast.success(MESSAGE.createAndPub, {
              position: "top-center",
            });
          } else {
            toast.success(MESSAGE.create, {
              position: "top-center",
            });
          }

          onClose();

          onSuccess?.(formData.departmentId);
        } else {
          setPublishErrorConfirm({
            visible: true,
            validateMsg: data.validateMsg,
          });
        }
      })
      .finally(() => {
        if (isPublish) {
          setSubmitLoading({
            publishLoading: false,
          });
        } else {
          setSubmitLoading({
            saveLoading: false,
          });
        }
        if (isConfirm) {
          setPublishErrorConfirm({
            loading: false,
          });
        }
      });
  };

  const onSubmit = (
    formData: ScheduleShiftCreateParams,
    isPublish: boolean
  ) => {
    if (formData.shiftStartTime === formData.shiftEndTime) {
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

    shiftId
      ? handleEdit(formData, isShiftPublish ? true : isPublish)
      : handleCreate(formData, isPublish);
  };

  const handleDepartmentChange = (departmentId: string) => {
    setValue("locationIds", []);
    setValue("workerRoleId", "");
    loadGetLocationList(departmentId);
    loadGetRoleList(departmentId);
  };

  const handleRoleChange = (roleId: string) => {
    // loadGetUserWorkerList(roleId);
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
          departmentId: getValues("departmentId")
            ? getValues("departmentId")
            : (departmentId as string),
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
          initDefaultUserWorkerList();
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
    isEdit: false,
    validateMsg: [] as string[],
  });

  const [deleteConfirm, setDeleteConfirm] = useSetState({
    visible: false,
    loading: false,
  });

  const onDelete = () => {
    setDeleteConfirm({
      visible: true,
    });
  };

  const deleteShift = async () => {
    try {
      setDeleteConfirm({
        loading: true,
      });
      const res = await scheduleShiftDelete(shiftId);
      if (res.code === 200) {
        toast.success(MESSAGE.delete);
        onClose();
        onSuccess?.(departmentIdForm);
      }
    } finally {
      setDeleteConfirm({
        visible: false,
        loading: false,
      });
    }
  };

  const [unpublishConfirm, setUnpublishConfirm] = useSetState({
    visible: false,
    loading: false,
  });

  const unpublishShift = async () => {
    setUnpublishConfirm({
      loading: true,
    });
    try {
      const res = await unPublishShift({
        shiftIds: [shiftId],
        scheduleId: scheduleId as string,
      });
      if (res.code === 200) {
        toast.success(MESSAGE.unpublish);
        onClose();
        onSuccess?.(departmentIdForm);
      }
    } finally {
      setUnpublishConfirm({
        loading: false,
      });
    }
  };

  return (
    <Dialog
      open
      width="517px"
      title={shiftId ? "Edit Shift" : "Add Shift"}
      onClose={onClose}
      loading={dialogLoading}
      contentWrapperClassName="pr-1"
    >
      <>
        <div className="overflow-y-auto overflow-x-hidden w-full max-h-[calc(100vh-180px)] pr-3 pb-4">
          <FormLabel label="Department" required>
            <FormItem
              name="departmentId"
              control={control}
              errors={errors.departmentId}
              rules={{ required: "This field is required." }}
              render={({ field: { value, onChange } }) => (
                <Select
                  isLoading={selectsInfo.departmentLoading}
                  options={selectsInfo.departmentOptions}
                  placeholder="Department"
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
                />
              )}
            />
          </FormLabel>
          <FormLabel label="Location">
            <>
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
            </>
          </FormLabel>

          <FormLabel label="Role" required>
            <FormItem
              name="workerRoleId"
              control={control}
              errors={errors.workerRoleId}
              rules={{ required: "This field is required." }}
              render={({ field: { value, onChange } }) => (
                <Select
                  isLoading={selectsInfo.roleLoading}
                  options={selectsInfo.roleOptions}
                  value={value}
                  onChange={(newValue) => {
                    onChange(newValue);
                    if (newValue) handleRoleChange(newValue);
                  }}
                  placeholder="Role"
                />
              )}
            />
          </FormLabel>
          <FormLabel label={`Shift Date (${zoneAbbr})`} required>
            <FormItem
              name="shiftDate"
              control={control}
              errors={errors.shiftDate}
              rules={{ required: "This field is required." }}
              render={({ field: { value, onChange } }) => {
                return shiftId ? (
                  <DatePicker
                    value={value[0]}
                    defaultPickerValue={defaultPickerValue}
                    onChange={(value) => {
                      onChange([value]);
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
                    allowClear={false}
                  />
                ) : (
                  <MultipleDatePicker
                    defaultPickerValue={defaultPickerValue}
                    disabledDate={(date) => {
                      let start = date.isSameOrAfter(localMoment(), "day");
                      let end = date.isSameOrBefore(
                        localMoment(weeklyDate.to, "MM/DD/YYYY"),
                        "day"
                      );
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
                      if (start && end) {
                        return false;
                      }

                      return true;
                    }}
                    value={value}
                    onChange={onChange}
                  />
                );
              }}
            />
          </FormLabel>

          <FormLabel
            label={`Shift Time (${zoneAbbr})`}
            required
            contentClassName="flex"
          >
            <>
              <FormItem
                className="flex-1 mr-[20px]"
                name="shiftStartTime"
                control={control}
                errors={errors.shiftStartTime}
                rules={{ required: "This field is required." }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <TimePicker
                      value={value}
                      onChange={(data) => {
                        onChange(data);
                      }}
                      placeholder="Select Start Time"
                    />
                  </>
                )}
              />
              <FormItem
                className="flex-1"
                name="shiftEndTime"
                control={control}
                errors={errors.shiftEndTime}
                rules={{ required: "This field is required." }}
                render={({ field: { value, onChange } }) => (
                  <TimePicker
                    value={value}
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
            </>
          </FormLabel>
          {/* DatePicker */}
          <FormLabel label="Employee">
            <FormItem
              name="userId"
              control={control}
              render={({ field }) => (
                <Select
                  isClearable
                  isSearchable
                  menuPlacement={
                    selectsInfo.employeeOptions.length >= 6 ? "top" : "bottom"
                  }
                  value={field.value}
                  isLoading={selectsInfo.employeeLoading}
                  options={selectsInfo.employeeOptions}
                  placeholder="Employee"
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

                      setValue("quantity", "1");
                    }
                  }}
                />
              )}
            />
          </FormLabel>

          {!shiftUserId && !shiftId && (
            <>
              <FormLabel label="No. of Shifts">
                <FormItem
                  name="quantity"
                  control={control}
                  render={({ field }) => {
                    const { value, onChange } = field;
                    return (
                      <CustomInput
                        value={value}
                        type="number"
                        onBlur={(e) => {
                          const value = e.target.value;
                          let res = Math.floor(Number(value));
                          res = res < 1 ? 1 : res;
                          res = res > 50 ? 50 : res;
                          onChange(res);
                        }}
                        onChange={(e) => {
                          const value = e.target.value;

                          onChange(value);
                        }}
                      ></CustomInput>
                    );
                  }}
                />
              </FormLabel>
            </>
          )}

          <FormLabel label="Notes">
            <FormItem
              name="note"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Textarea
                  value={value}
                  onChange={onChange}
                  placeholder="Notes"
                />
              )}
            />
          </FormLabel>

          <div className="w-full flex justify-end mt-4">
            <CustomButton
              onClick={onClose}
              variant={"outline"}
              className="w-[110px]"
              disabled={
                submitLoading.deleteLoading ||
                submitLoading.saveLoading ||
                submitLoading.publishLoading
              }
            >
              Cancel
            </CustomButton>

            {shiftId && (
              <CustomButton
                loading={submitLoading.deleteLoading}
                colorStyle={"red"}
                className="w-[110px] ml-[22px]"
                onClick={onDelete}
              >
                Delete
              </CustomButton>
            )}

            {isShowUnpublishConfirm && (
              <CustomButton
                colorStyle={"yellow"}
                className="w-[110px] ml-[22px]"
                onClick={() => {
                  setUnpublishConfirm({
                    visible: true,
                  });
                }}
              >
                Unpublish
              </CustomButton>
            )}

            <CustomButton
              loading={
                shiftId && isShiftPublish
                  ? submitLoading.publishLoading
                  : submitLoading.saveLoading
              }
              colorStyle={
                (shiftId && !isShiftPublish && !hasDraftSchedule) ||
                (!shiftId && !hasDraftSchedule)
                  ? "yellow"
                  : undefined
              }
              className="w-[110px] ml-[22px]"
              onClick={handleSubmit((data) => {
                onSubmit(data, false);
              })}
            >
              Save
            </CustomButton>

            {((shiftId && !isShiftPublish && !hasDraftSchedule) ||
              (!shiftId && !hasDraftSchedule)) && (
              <CustomButton
                loading={submitLoading.publishLoading}
                className="w-[140px] ml-[22px]"
                onClick={handleSubmit((data) => {
                  onSubmit(data, true);
                })}
              >
                Save & Publish
              </CustomButton>
            )}
          </div>
          {shiftId && (
            <ShiftHistory shiftId={shiftId} className="px-0"></ShiftHistory>
          )}
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
                isEdit: false,
                validateMsg: [],
              });
            }}
            onOk={() => {
              if (publishErrorConfirm.isEdit) {
                handleEdit(getValues(), true, true);
              } else {
                handleCreate(getValues(), true, true);
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
        {deleteConfirm.visible && (
          <ConfirmDialog
            open={deleteConfirm.visible}
            btnLoading={deleteConfirm.loading}
            width="560px"
            onClose={() => {
              setDeleteConfirm({
                visible: false,
                loading: false,
              });
            }}
            onOk={() => {
              deleteShift();
            }}
          >
            Are you sure you want to delete this shift?
          </ConfirmDialog>
        )}
        {unpublishConfirm.visible && (
          <ConfirmDialog
            open={unpublishConfirm.visible}
            btnLoading={unpublishConfirm.loading}
            width="560px"
            onClose={() => {
              setUnpublishConfirm({
                visible: false,
                loading: false,
              });
            }}
            onOk={() => {
              unpublishShift();
            }}
          >
            Are you sure you want to unpublish this shift?
          </ConfirmDialog>
        )}
      </>
    </Dialog>
  );
};
export default AddShiftDialog;
