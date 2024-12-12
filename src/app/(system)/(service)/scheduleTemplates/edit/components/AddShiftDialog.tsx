import { useSetState } from "ahooks";
import { useUpdateEffect } from "ahooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { locationListSearch } from "@/api/location";
import {
  joinDepartmentApi,
  scheduleTemplateShiftCreate,
  scheduleTemplateShiftDelete,
  scheduleTemplateShiftEdit,
  scheduleTemplateShiftInfo,
} from "@/api/scheduleTemplates";
import { ScheduleTemplateShiftCreateParams } from "@/api/scheduleTemplates/types";
import {
  getTemplateUserListWithStatus,
  getUserWorkerListRoleAll,
} from "@/api/user";
import { GetUserWorkerListRoleAllReq } from "@/api/user/types";
import { workerRoleList } from "@/api/workerRole";
import CustomButton from "@/components/custom/Button";
import Dialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomInput from "@/components/custom/Input";
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
import useGlobalTime from "@/hooks/useGlobalTime";
import sortListByKey from "@/utils/sortByKey";
import { convert12to24 } from "@/utils/time";
import SixteenHoursIcon from "~/icons/shiftStatus/16hoursIcon.svg";
import DoubleBookedIcon from "~/icons/shiftStatus/DoubleBookedIcon.svg";
import OvertimeIcon from "~/icons/shiftStatus/OvertimeIcon.svg";
import TargetExceededIcon from "~/icons/shiftStatus/TargetExceededIcon.svg";

type AddShiftDialogDialogProps = {
  communityId: string;
  templateId: string;
  departmentId?: string;
  shiftId?: string;
  dayOfWeek?: number[];
  workerRoleId?: string;
  userId?: string;
  onClose: () => void;
  onSuccess?: () => void;
  onClear?: (id: string) => void;
};

const AddShiftDialog = (props: AddShiftDialogDialogProps) => {
  const {
    communityId,
    templateId,
    departmentId,
    shiftId = "",
    dayOfWeek = [],
    workerRoleId = "",
    userId = "",
    onClose,
    onSuccess,
    onClear,
  } = props;

  const divRef = useRef<HTMLDivElement>(null);

  const { localMoment, zoneAbbr } = useGlobalTime();

  const [submitLoading, setSubmitLoading] = useState(false);

  const [confirmInfo, setConfirmInfo] = useSetState<{
    isShowConfirm: boolean;
    loading: boolean;
    userId: string;
  }>({
    loading: false,
    userId: "",
    isShowConfirm: false,
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
    formState: { errors },
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    setError,
  } = useForm<ScheduleTemplateShiftCreateParams>({
    defaultValues: {
      departmentId: "",
      locationIds: [],
      workerRoleId: "",
      userId: "",
      startTime: "",
      endTime: "",
      dayOfWeek: [],
      quantity: "1",
    },
  });

  const startTimeValue = watch("startTime");
  const endTimeValue = watch("endTime");
  const dayOfWeekValue = watch("dayOfWeek");
  const workerRoleIdValue = watch("workerRoleId");
  const userIdWatch = watch("userId");

  const [isOpen, setIsOpen] = useState(false);
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

  const formatUserInfoString = (value: string | undefined | null) => {
    if (!value) return;
    return value.replaceAll(",", ", ");
  };

  const initDefaultUserWorkerList = (roleId?: string) => {
    if (!communityId) {
      return;
    }

    const params = {
      communityId,
      departmentIds: departmentId,
      roleId,
    };
    getUserWorkerListRoleAll({ ...params })
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

  const loadGetUserWorkerList = (roleId?: string) => {
    if (!communityId) {
      return;
    }

    const values = getValues();
    getTemplateUserListWithStatus({
      communityId,
      departmentId: departmentId || "",
      workerRoleId: values ? values.workerRoleId : "",
      templateId: templateId,
      searchUserQuery: {
        shiftIds: shiftId,
        startTime: values ? convert12to24(values.startTime) : "",
        endTime: values ? convert12to24(values.endTime) : "",
        dayOfWeek:
          values && values.dayOfWeek ? values.dayOfWeek.join(",") : null,
        chooseSelectShifts: [],
        intersection: false,
        operateType: shiftId ? "UPDATE" : "INSERT",
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

  const loadGetShiftDetail = () => {
    if (!shiftId) return;

    scheduleTemplateShiftInfo(shiftId).then(({ code, data }) => {
      if (code !== 200) return;

      const {
        departmentId,
        locationRefVOs,
        workerRoleId,
        userId,
        startTime,
        endTime,
        dayOfWeek,
      } = data;

      reset({
        departmentId,
        locationIds: locationRefVOs.map((item) => item.locationId),
        workerRoleId,
        userId,
        startTime,
        endTime,
        dayOfWeek: [dayOfWeek],
        quantity: "1",
      });
    });
  };

  const initValue = () => {
    reset({
      departmentId,
      dayOfWeek: dayOfWeek,
      workerRoleId,
      userId,
      quantity: "1",
    });

    // if (workerRoleId) {
    //   loadGetUserWorkerList(workerRoleId);
    // } else {
    //   loadGetUserWorkerList();
    // }
    initDefaultUserWorkerList();
  };

  useEffect(() => {
    // Initialize fill values
    initValue();

    loadGetLocationList();
    loadGetRoleList();

    loadGetShiftDetail();
  }, []);

  useUpdateEffect(() => {
    const values = getValues();
    if (
      templateId &&
      communityId &&
      departmentId &&
      values.endTime &&
      values.startTime &&
      values.dayOfWeek != null &&
      values.dayOfWeek.length > 0
    ) {
      loadGetUserWorkerList();
    }
  }, [endTimeValue, startTimeValue, dayOfWeekValue, workerRoleIdValue]);

  useEffect(() => {
    if (isOpen && divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [isOpen]);

  const handleCreate = (formData: ScheduleTemplateShiftCreateParams) => {
    setSubmitLoading(true);
    scheduleTemplateShiftCreate({
      templateId,
      communityId,
      ...formData,
    })
      .then(({ code }) => {
        if (code !== 200) return;

        toast.success(MESSAGE.create, {
          position: "top-center",
        });

        onClose();

        onSuccess && onSuccess();
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  };

  const handleEdit = (formData: ScheduleTemplateShiftCreateParams) => {
    setSubmitLoading(true);
    scheduleTemplateShiftEdit({
      id: shiftId,
      templateId,
      communityId,
      ...formData,
    })
      .then(({ code }) => {
        if (code !== 200) return;

        toast.success(MESSAGE.edit, {
          position: "top-center",
        });

        onClose();

        onSuccess && onSuccess();
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

  const onSubmit = (formData: ScheduleTemplateShiftCreateParams) => {
    if (formData.startTime === formData.endTime) {
      setError("startTime", {
        type: "manual",
        message: "Start time cannot equal end time",
      });

      setError("endTime", {
        type: "manual",
        message: "Start time cannot equal end time",
      });
      return;
    }

    shiftId ? handleEdit(formData) : handleCreate(formData);
  };

  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false);

  const handleDeleteShift = () => {
    scheduleTemplateShiftDelete([shiftId].join(",")).then(() => {
      toast.success(MESSAGE.delete, {
        position: "top-center",
      });

      onClose();

      setIsShowDeleteDialog(false);

      onSuccess?.();

      onClear?.(shiftId);
    });
  };

  const getDiffTime = useMemo(() => {
    const startTime = watch("startTime");
    const endTime = watch("endTime");

    if (!startTime || !endTime) return;

    const startDate = localMoment(startTime, "hh:mm A");
    let endDate = localMoment(endTime, "hh:mm A");

    if (endDate.isSameOrBefore(startDate)) {
      endDate = endDate.add(1, "day");
    }

    const minutesDifference = endDate.diff(startDate, "minutes");

    const hours = (minutesDifference / 60).toFixed(2);

    return { hours };
  }, [watch("startTime"), watch("endTime")]);

  return (
    <Dialog
      open
      width="517px"
      title={shiftId ? "Edit Shift" : "Add Shift"}
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

          {shiftId && (
            <CustomButton
              onClick={() => setIsShowDeleteDialog(true)}
              variant={"outline"}
              className="w-[110px] ml-[22px] bg-[#EF4444E5] text-[#FFF] hover:bg-[#EF4444E5] hover:text-[#FFF]"
              disabled={submitLoading}
            >
              Delete
            </CustomButton>
          )}

          <CustomButton
            loading={submitLoading}
            className="w-[110px] ml-[22px]"
            onClick={handleSubmit(onSubmit)}
          >
            Save
          </CustomButton>
        </div>
      }
    >
      <div className="px-1 overflow-auto" ref={divRef}>
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
                onChange={(v) => {
                  onChange(v);

                  // if (!v) return;
                  // loadGetUserWorkerList(v);
                }}
                placeholder="Role"
              />
            )}
          />
        </FormLabel>
        <FormLabel label="Day of Week" required>
          <FormItem
            name="dayOfWeek"
            control={control}
            errors={errors.dayOfWeek}
            rules={{ required: "This field is required." }}
            render={({ field: { value, onChange } }) => (
              <Select
                isMulti={!shiftId}
                menuPlacement="bottom"
                options={selectsInfo.dayOfWeekOptions}
                value={!shiftId ? value : value[0]}
                onChange={(v) => {
                  onChange(!shiftId ? v : [v]);
                }}
                onMenuOpen={() => {
                  setIsOpen(true);
                }}
                onMenuClose={() => {
                  setIsOpen(false);
                }}
                placeholder="Day of Week"
              />
            )}
          />
        </FormLabel>

        <FormLabel
          label={`Shift Time (${zoneAbbr})`}
          required
          contentClassName="flex"
        >
          <FormItem
            className="flex-1 mr-[20px]"
            name="startTime"
            control={control}
            errors={errors.startTime}
            rules={{ required: "This field is required." }}
            render={({ field: { value, onChange } }) => (
              <TimePicker
                value={value}
                onChange={(data) => {
                  onChange(data);
                }}
                placeholder="Select Start Time"
              />
            )}
          />

          <FormItem
            className="flex-1"
            name="endTime"
            control={control}
            errors={errors.endTime}
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

          {watch("startTime") && watch("endTime") && (
            <>
              <div className="flex justify-center pt-[10px] pl-[10px] w-[50px]">
                {getDiffTime?.hours}h
              </div>
            </>
          )}
        </FormLabel>

        <FormLabel label="Employee (Optional)">
          <FormItem
            name="userId"
            control={control}
            render={({ field }) => (
              <Select
                isClearable
                isLoading={selectsInfo.employeeLoading}
                options={selectsInfo.employeeOptions}
                {...field}
                placeholder="Employee (Optional)"
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

                    setValue("quantity", "1");
                  }
                }}
                onMenuOpen={() => {
                  setIsOpen(true);
                }}
                onMenuClose={() => {
                  setIsOpen(false);
                }}
              />
            )}
          />
        </FormLabel>

        {!userIdWatch && !shiftId && (
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
        )}

        <ConfirmDialog
          open={isShowDeleteDialog}
          onClose={() => {
            setIsShowDeleteDialog(false);
          }}
          onOk={handleDeleteShift}
        >
          Are you sure you want to delete this shift?
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
      </div>
    </Dialog>
  );
};
export default AddShiftDialog;
