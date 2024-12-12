import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Control, FieldErrors } from "react-hook-form";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import { shiftBreakList } from "@/api/currentSchedule";
import { ScheduleShiftCreateParams } from "@/api/currentSchedule/types";
import { CheckType } from "@/app/(system)/(service)/timeAndAttendance/types";
import CheckLocationDia from "@/components/checkLocation";
import CustomButton from "@/components/custom/Button";
import DatePicker from "@/components/custom/DatePicker";
import Dialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import Input from "@/components/custom/Input";
import Select, { OptionType } from "@/components/custom/Select";
import CustomTable, { RefProps } from "@/components/custom/Table";
import TimePicker from "@/components/custom/TimePicker";
import { FormItem, FormLabel } from "@/components/FormComponent";
import useGlobalTime from "@/hooks/useGlobalTime";
import { cn } from "@/lib/utils";
import Add from "~/icons/AddIcon.svg";
import LocationIcon from "~/icons/locationIcon.svg";

import { LocationInfo } from "../../types";
import { TimeAndAttendanceFromVo, TimeAndAttendanceVo } from "../../types";
import useReturnTableColumn from "./tableColumn";
type TimeAndAttendanceSettingProps = {
  control: Control<ScheduleShiftCreateParams, any>;
  errors: FieldErrors<ScheduleShiftCreateParams>;
  shiftId: string;
  checkInUTC: string | undefined;
  checkOutUTC: string | undefined;
  locationInfo: LocationInfo;
  isHasApproveAttendancePermission: boolean;
};

const TimeAndAttendanceSetting = (
  props: TimeAndAttendanceSettingProps,
  ref: React.Ref<unknown>
) => {
  const { UTCMoment, zoneAbbr } = useGlobalTime();
  const {
    isHasApproveAttendancePermission,
    control,
    errors,
    shiftId,
    checkInUTC,
    checkOutUTC,
    locationInfo,
  } = props;
  const [tableData, setTableDate] = useState<TimeAndAttendanceVo[]>([]);
  const [backupTableData, setBackupTableDate] = useState<TimeAndAttendanceVo[]>(
    []
  );
  const [breakTypeOptions] = useState<OptionType[]>([
    { label: "Break", value: "Break" },
    { label: "Meal", value: "Meal" },
  ]);
  const getShiftBreakList = async () => {
    try {
      const { data, code } = await shiftBreakList(shiftId);
      if (code !== 200) return;
      const tableData = data.map((item: any) => {
        return {
          ...item,
          isApiData: true,
        };
      });
      setTableDate(tableData);
      setBackupTableDate(JSON.parse(JSON.stringify(tableData)));
    } catch (error) {}
  };

  useEffect(() => {
    if (shiftId) getShiftBreakList();
  }, [shiftId]);

  const getDate = (local: string | undefined): string =>
    local ? UTCMoment(local).format("MM/DD/YYYY") : "";

  const getTime = (local: string | undefined): string =>
    local ? UTCMoment(local).format("hh:mm A") : "";

  const [checkLocationOpen, setCheckLocationOpen] = useState<boolean>(false);
  const [confirmDia, setConfirmDia] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [diaType, setDiaType] = useState<"Edit" | "Add">();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formDialogLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [checkInData, setCheckInData] = useState({
    date: getDate(checkInUTC),
    time: getTime(checkInUTC),
  });
  const [checkOutData, setCheckOutData] = useState({
    date: getDate(checkOutUTC),
    time: getTime(checkOutUTC),
  });
  const {
    control: dialogFormControl,
    formState: { errors: dialogFormErrors },
    handleSubmit,
    setValue,
    // setError,
    // getValues,
    resetField,
  } = useForm<TimeAndAttendanceFromVo>({
    defaultValues: {
      breakType: "",
      durationMins: "",
    },
  });
  const [tableRowId, setTableRowId] = useState<string>("");
  const [checkType, setCheckType] = useState<CheckType>("checkin");
  const checkLocation = (type: CheckType) => {
    setCheckType(type);
    setCheckLocationOpen(true);
  };
  // Add or Edit
  const onSubmit = (formData: TimeAndAttendanceFromVo): void => {
    setSubmitLoading(true);
    try {
      if (diaType === "Edit") {
        // handle Edit
        const list = tableData.map((row) => {
          if (row.id === tableRowId) {
            const { durationMins, breakType } = formData;
            row.durationMins = durationMins;
            row.breakType = breakType;
          }
          return row;
        });
        setTableDate(list);
      } else {
        // handle Add
        setTableDate([...tableData, { id: uuidv4(), ...formData }]);
        setFormDialogOpen(false);
      }
    } finally {
      setSubmitLoading(false);
      onFormDialogClose();
    }
  };
  const resetForm = (): void => {
    resetField("breakType");
    resetField("durationMins");
    setValue("breakType", "");
    setValue("durationMins", "");
  };
  const onFormDialogClose = (): void => {
    resetForm();
    setFormDialogOpen(false);
  };
  const tableRef = useRef<RefProps>();
  const handleDelete = (id: string): void => {
    if (tableData.length === 1) return;
    setTableRowId(id);
    setConfirmDia(true);
  };
  const handleEdit = ({
    breakType,
    durationMins,
    id,
  }: TimeAndAttendanceVo): void => {
    setTableRowId(id);
    setValue("breakType", breakType);
    setValue("durationMins", durationMins);
    setDiaType("Edit");
    setFormDialogOpen(true);
  };
  const handleAdd = (): void => {
    setDiaType("Add");
    setFormDialogOpen(true);
  };
  // delete
  const inviteConfirmFn = async (): Promise<void> => {
    try {
      setConfirmLoading(true);
      setTableDate(tableData.filter((item) => item.id !== tableRowId));
      setConfirmDia(false);
    } finally {
      setConfirmLoading(false);
    }
  };
  // const isCanEditBreakTime = useMemo(() => !!checkOutUTC, [checkOutUTC]);
  const { columns } = useReturnTableColumn({
    disableDelete: tableData.length === 1,
    isHasApproveAttendancePermission,
    handleDelete,
    handleEdit,
  });
  const handleDefaultLocal = (
    value: string,
    local: string | undefined,
    type: "date" | "time"
  ): string => {
    if (!local) return "";
    return value
      ? value
      : local
      ? UTCMoment(local).format(type === "date" ? "MM/DD/YYYY" : "hh:mm A")
      : "";
  };
  const getLocation = (type: CheckType) => {
    const data = locationInfo[type];
    return {
      data,
      isShow: data.lat && data.lng,
    };
  };
  const compareCheckIn = () => {
    const originCheckInDate = getDate(checkInUTC);
    const originCheckInTime = getTime(checkInUTC);
    const { date: checkInDate, time: checkInTime } = checkInData;
    return (
      originCheckInDate === checkInDate && originCheckInTime === checkInTime
    );
  };
  const compareCheckOut = () => {
    const originCheckOutDate = getDate(checkOutUTC);
    const originCheckOutTime = getTime(checkOutUTC);
    const { date: checkOutDate, time: checkOutTime } = checkOutData;
    return (
      originCheckOutDate === checkOutDate && originCheckOutTime === checkOutTime
    );
  };
  const compareCheck = (): boolean => {
    return compareCheckIn() && compareCheckOut();
  };
  useImperativeHandle(ref, () => ({
    compareCheck: () => {
      return compareCheck();
    },
    getCheckInData: () => checkInData,
    getCheckOutData: () => checkOutData,
    getCheckData: () => {
      const { date: checkInDate, time: checkInTime } = checkInData;
      const { date: checkOutDate, time: checkOutTime } = checkOutData;
      return {
        checkin:
          checkInDate && checkInTime
            ? compareCheckIn()
              ? null
              : `${checkInDate} ${checkInTime}`
            : null,
        checkout:
          checkOutDate && checkOutTime
            ? compareCheckOut()
              ? null
              : `${checkOutDate} ${checkOutTime}`
            : null,
        checkInData,
        checkOutData,
      };
    },
    getTableData: () => {
      return {
        tableData,
        backupTableData,
      };
    },
  }));
  return (
    <>
      <FormLabel label="Check In Time" contentClassName="flex items-center">
        {isHasApproveAttendancePermission && (
          <FormItem
            className="flex-1 mr-[20px]"
            name="checkInDate"
            control={control}
            errors={errors.shiftStartTime}
            render={({ field: { value, onChange } }) => (
              <DatePicker
                value={handleDefaultLocal(value, checkInUTC, "date")}
                onChange={(value) => {
                  setCheckInData({
                    time: checkInData.time,
                    date: value || "",
                  });
                  onChange(value);
                }}
                allowClear={false}
                placeholder="Select Date"
              />
            )}
          />
        )}
        {!isHasApproveAttendancePermission && checkInData.date && (
          <div className="text-[#919FB4]">
            <span>
              {checkInData.date} ({zoneAbbr})
            </span>
            <span className="mx-2"></span>
          </div>
        )}
        {isHasApproveAttendancePermission && (
          <FormItem
            className="flex-1"
            name="checkInTime"
            control={control}
            errors={errors.shiftEndTime}
            render={({ field: { value, onChange } }) => (
              <TimePicker
                value={handleDefaultLocal(value, checkInUTC, "time")}
                onChange={(data) => {
                  setCheckInData({
                    time: data || "",
                    date: checkInData.date,
                  });
                  onChange(data);
                }}
                placeholder="Select Time"
              />
            )}
          />
        )}
        {!isHasApproveAttendancePermission && checkInData.time && (
          <div className="text-[#919FB4]">{checkInData.time}</div>
        )}
        <div
          className={cn(
            "flex justify-center cursor-pointer w-20",
            isHasApproveAttendancePermission && "mb-[22px]"
          )}
        >
          {shiftId && getLocation("checkin").isShow && (
            <LocationIcon
              width={16}
              height={16}
              onClick={() => {
                checkLocation("checkin");
              }}
            ></LocationIcon>
          )}
        </div>
      </FormLabel>

      <FormLabel label="Check Out Time" contentClassName="flex items-center">
        {isHasApproveAttendancePermission && (
          <FormItem
            className="flex-1 mr-[20px]"
            name="checkOutDate"
            control={control}
            errors={errors.shiftStartTime}
            render={({ field: { value, onChange } }) => (
              <DatePicker
                value={handleDefaultLocal(value, checkOutUTC, "date")}
                onChange={(value) => {
                  setCheckOutData({
                    time: checkOutData.time,
                    date: value || "",
                  });
                  onChange(value);
                }}
                allowClear={false}
                placeholder="Select Date"
              />
            )}
          />
        )}
        {!isHasApproveAttendancePermission && checkOutData.date && (
          <div className="text-[#919FB4]">
            <span>
              {checkOutData.date} ({zoneAbbr})
            </span>
            <span className="mx-2"></span>
          </div>
        )}
        {isHasApproveAttendancePermission && (
          <FormItem
            className="flex-1"
            name="checkOutTime"
            control={control}
            errors={errors.shiftEndTime}
            render={({ field: { value, onChange } }) => (
              <TimePicker
                value={handleDefaultLocal(value, checkOutUTC, "time")}
                onChange={(data) => {
                  setCheckOutData({
                    time: data || "",
                    date: checkOutData.date,
                  });
                  onChange(data);
                }}
                placeholder="Select Time"
              />
            )}
          />
        )}
        {!isHasApproveAttendancePermission && checkOutData.time && (
          <div className="text-[#919FB4]">{checkOutData.time}</div>
        )}
        <div
          className={cn(
            "flex justify-center cursor-pointer w-20",
            isHasApproveAttendancePermission && "mb-[22px]"
          )}
        >
          {shiftId && getLocation("checkout").isShow && (
            <LocationIcon
              width={16}
              height={16}
              onClick={() => {
                checkLocation("checkout");
              }}
            ></LocationIcon>
          )}
        </div>
      </FormLabel>

      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[#324664]">Break Times</span>
          {isHasApproveAttendancePermission && (
            <div
              className="flex items-center cursor-pointer"
              onClick={handleAdd}
            >
              <Add className="mr-2" width={8} color={"#EB1DB2"}></Add>
              <span className="text-[#EB1DB2]">Add</span>
            </div>
          )}
        </div>
        <CustomTable
          columns={columns}
          data={tableData}
          loading={false}
          ref={tableRef}
          manualPagination={true}
          adaptive={false}
          height="auto"
          className="min-h-[100px]"
        />
      </div>
      <ConfirmDialog
        btnLoading={confirmLoading}
        open={confirmDia}
        onClose={() => {
          setConfirmDia(false);
        }}
        onOk={() => {
          inviteConfirmFn();
        }}
      >
        Are you sure you want to delete this Break Time?
      </ConfirmDialog>
      <Dialog
        open={formDialogOpen}
        width="517px"
        title={`${diaType} Break Time`}
        onClose={onFormDialogClose}
        loading={formDialogLoading}
        contentWrapperClassName="pr-1"
      >
        <div className="pr-4">
          <FormLabel label="Break Type" required>
            <FormItem
              name="breakType"
              control={dialogFormControl}
              errors={dialogFormErrors.breakType}
              rules={{ required: "This field is required." }}
              render={({ field: { value, onChange } }) => (
                <Select
                  options={breakTypeOptions}
                  value={value}
                  onChange={(newValue) => {
                    onChange(newValue);
                  }}
                  placeholder="Break Type"
                />
              )}
            />
          </FormLabel>

          <FormLabel label="Break Time (mins)" required>
            <FormItem
              name="durationMins"
              control={dialogFormControl}
              errors={dialogFormErrors.durationMins}
              rules={{ required: "This field is required." }}
              render={({ field }) => (
                <Input
                  type="number"
                  {...field}
                  className="h-12"
                  placeholder="Break Time"
                />
              )}
            />
          </FormLabel>
          <div className="flex justify-end">
            <CustomButton
              onClick={onFormDialogClose}
              variant={"outline"}
              className="w-[110px]"
              disabled={submitLoading}
            >
              Cancel
            </CustomButton>

            <CustomButton
              loading={submitLoading}
              className="w-[110px] ml-[22px] bg-[#EB1DB2]"
              onClick={handleSubmit((data) => {
                onSubmit(data);
              })}
            >
              Save
            </CustomButton>
          </div>
        </div>
      </Dialog>
      <CheckLocationDia
        open={checkLocationOpen}
        onClose={() => setCheckLocationOpen(false)}
        location={locationInfo[checkType]}
        checkType={checkType}
      ></CheckLocationDia>
    </>
  );
};

export default forwardRef(TimeAndAttendanceSetting);
