import moment from "moment";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getRoleListApi } from "@/api/admin/employees";
import { getDptSelect } from "@/api/department";
import { batchEdit } from "@/api/employees";
import CustomButton from "@/components/custom/Button";
import DatePicker from "@/components/custom/DatePicker";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import CustomInput from "@/components/custom/Input";
import Select from "@/components/custom/Select";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";
import useGlobalTime from "@/hooks/useGlobalTime";

import useFormCreate from "../hooks/batchFormEdit";
import { AddTypeEmployeeParams, EmployeesVo } from "../type";
interface BulkEditProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: EmployeesVo | null;
  onClose: () => void;
  getLsit: () => void;
  communityId: string;
  chooseWorkId: string[];
}
const BulkEdit = (props: BulkEditProps) => {
  const {
    open,
    editItem,
    setOpen,
    onClose,
    getLsit,
    communityId,
    chooseWorkId,
  } = props;

  const { zoneAbbr } = useGlobalTime();

  const { form } = useFormCreate({ editItem, open });
  const [loading, setLoading] = useState(false);
  const [workerRoleList, setWorkerRoleList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);

  useEffect(() => {
    if (communityId) {
      getRoleList(communityId);
      getDeptList(communityId);
    }
  }, [communityId]);
  const addTypeDictinaryFn = async (data: AddTypeEmployeeParams) => {
    const terminationDate: any = data.terminationDate;
    const hireDate: any = data.hireDate;
    const params: any = {
      ...data,
      terminationDate:
        terminationDate && moment(terminationDate).format("MM/DD/YYYY"),
      hireDate: terminationDate && moment(hireDate).format("MM/DD/YYYY"),
      workerIds: chooseWorkId,
    };
    setLoading(true);
    try {
      const res = await batchEdit(params);
      if (res.code === 200) {
        toast.success(MESSAGE.edit, {
          position: "top-center",
        });
        setLoading(false);
        onClose();
        getLsit();
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleList = async (data: string) => {
    try {
      const res = await getRoleListApi(data);
      if (res.code === 200) {
        const result: { label: string; value: string }[] = res.data.map(
          (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          }
        );
        setWorkerRoleList(result as []);
      }
    } finally {
    }
  };

  const getDeptList = async (data: string) => {
    try {
      const res = await getDptSelect(data, 0);
      if (res.code === 200) {
        const result: { label: string; value: string }[] = res.data.map(
          (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          }
        );
        setDepartmentList(result as []);
      }
    } finally {
    }
  };
  return (
    <CustomDialog
      title="Bulk Edit"
      open={open}
      width="860px"
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      <CustomForm
        form={form}
        className="py-4 px-6"
        onSubmit={(data) => {
          addTypeDictinaryFn(data);
        }}
      >
        <div className="font-[390] text-[#00000040] leading-[40px] mb-[30px]">
          Notes: Please type into the field(s) that you want to make updates to
          the employee data. The field(s) left blank here will not affect the
          employee data.
        </div>
        <div className="flex space-x-12 mb-[10px]">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <CustomFormItem label="License/Credential">
                  <CustomInput placeholder="License/Credential" {...field} />
                </CustomFormItem>
              )}
            />
          </div>

          <div className="flex-1">
            <FormField
              control={form.control}
              name="departmentIds"
              render={({ field }) => (
                <CustomFormItem label="Department">
                  <Select
                    options={departmentList}
                    value={field.value}
                    isMulti
                    isWrap
                    onChange={field.onChange}
                    placeholder="Department"
                  />
                </CustomFormItem>
              )}
            />
          </div>
        </div>

        <div className="flex space-x-12 mb-[10px]">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <CustomFormItem label="Roles Allowed to Work">
                  <Select
                    options={workerRoleList}
                    isMulti
                    isWrap
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Roles Allowed to Work"
                  />
                </CustomFormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="hireDate"
              render={({ field }) => (
                <CustomFormItem
                  label={`Hire Date (${zoneAbbr})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <DatePicker
                    value={field.value}
                    onChange={(date) => {
                      field.onChange({
                        target: {
                          value: date,
                        },
                      });
                    }}
                    placeholder="Hire Date"
                    disabledDate={(current) => {
                      return current && current > moment().startOf("day");
                    }}
                  ></DatePicker>
                </CustomFormItem>
              )}
            />
          </div>
        </div>
        <div className="flex space-x-12 mb-[10px]">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="targetedHoursPerWeek"
              render={({ field }) => (
                <CustomFormItem label="Targeted Hours Per Week">
                  <CustomInput
                    placeholder="Targeted Hours Per Week"
                    {...field}
                  />
                </CustomFormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="terminationDate"
              render={({ field }) => (
                <CustomFormItem
                  label={`Termination Date (${zoneAbbr})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <DatePicker
                    value={field.value}
                    onChange={(date) => {
                      field.onChange({
                        target: {
                          value: date,
                        },
                      });
                    }}
                    placeholder="Termination Date"
                    disabledDate={(current) => {
                      return current && current > moment().startOf("day");
                    }}
                  ></DatePicker>
                </CustomFormItem>
              )}
            />
          </div>
        </div>

        {/* edit */}
        <div className="flex gap-6 justify-end">
          <CustomButton
            onClick={() => {
              setOpen(false);
              onClose();
            }}
            variant="outline"
            type="button"
          >
            Cancel
          </CustomButton>

          <CustomButton loading={loading} type="submit">
            Save
          </CustomButton>
        </div>
      </CustomForm>
    </CustomDialog>
  );
};
export default BulkEdit;
