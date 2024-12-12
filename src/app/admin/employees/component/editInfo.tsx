import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { editEmployeeAdmin, getRoleListApi } from "@/api/admin/employees";
import { getDptSelect } from "@/api/department";
import {
  messageValidatePhoneNumber,
  messageValidatePhoneNumber4LineType,
} from "@/api/reports";
import { getSuperAdminCommunityList } from "@/api/user";
import CustomButton from "@/components/custom/Button";
import DatePicker from "@/components/custom/DatePicker";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import CustomInput from "@/components/custom/Input";
import CustomPhoneInput from "@/components/custom/PhoneInput/phoneInput";
import Select from "@/components/custom/Select";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";
import useGlobalTime from "@/hooks/useGlobalTime";

import useFormCreate from "../hooks/form";
import { EmployeesVo } from "../type";
interface EditInfoProps {
  currentBtn?: string;
  isAdd: boolean;
  editItem: EmployeesVo | null;
  open: boolean;
  isView: boolean | undefined;
  isFocus: boolean;
}

interface List {
  label: string;
  value: string;
  __isNew__?: boolean;
}

const EditInfo = (props: EditInfoProps) => {
  const { editItem, isAdd, open, isView, isFocus } = props;

  const { zoneAbbr, localMoment } = useGlobalTime();

  if (editItem) {
    // edit
    const { roles, departments, hireDate, terminationDate }: any = editItem;

    editItem.targetedHoursPerWeek = editItem.targetedHoursPerWeek
      ? editItem.targetedHoursPerWeek + ""
      : "";
    editItem.hireDate = hireDate
      ? localMoment(hireDate, "YYYY-MM-DD").format("MM/DD/YYYY")
      : "";
    editItem.terminationDate = terminationDate
      ? localMoment(terminationDate, "YYYY-MM-DD").format("MM/DD/YYYY")
      : "";
    editItem.workerRoleIds = roles.map((item: { id: string }) => item.id);
    editItem.departmentIds = departments
      .filter((item: any) => item != null)
      .map((item: { deptId: string }) => item.deptId);
  }

  const { form } = useFormCreate({ editItem, isAdd, open });

  const aaa = form.watch("departmentIds");

  console.log(aaa);

  const [loading, setLoading] = useState(false);
  const [workerRoleList, setWorkerRoleList] = useState([]);
  const [departmentList, setDepartmentList] = useState<
    {
      label: string;
      value: string;
      isFixed?: boolean;
      isDisabled?: boolean;
    }[]
  >([]);

  useEffect(() => {
    if (editItem) {
      getRoleList(editItem.userCommunityId);
      getAllDepartment(editItem.userCommunityId);
    }
  }, [editItem]);

  const editTypeDictinaryFn = async (data: any) => {
    const { id, userId, workerId } = editItem as EmployeesVo;
    data.id = id;
    data.userId = userId;

    let param: any = {
      ...data,
    };
    param = {
      ...data,
      terminationDate: data.terminationDate ? data.terminationDate : "",
      hireDate: data.hireDate ? data.hireDate : "",
      workerId: workerId ? workerId : undefined,
    };

    setLoading(true);
    try {
      const res = await editEmployeeAdmin(param);

      if (res.code === 200) {
        toast.success(MESSAGE.edit, {
          position: "top-center",
        });
        setLoading(false);
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

  const getAllDepartment = async (communityId: string) => {
    try {
      const res = await getDptSelect(communityId, 0);
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

  const onSubmit = async (data: any) => {
    try {
      const res = await messageValidatePhoneNumber4LineType(
        form.getValues("nationalPhone").replace(/\s+/g, "")
      );
      let editObj: any = {
        ...data,
        id: editItem && editItem.id,
      };
      if (res.code === 200) {
        if (
          res.data.valid &&
          res.data.lineTypeIntelligence?.type !== "landline"
        ) {
          editObj.phone = res.data.phoneNumber.endpoint;
          editObj.nationalPhone =
            "+" + res.data.callingCountryCode + " " + res.data.nationalFormat;
          editTypeDictinaryFn(editObj);
        } else {
          form.setError("nationalPhone", { message: "Invalid phone number." });
        }
      }
    } finally {
    }
  };

  const workerRoleIdsRef = useRef<any>(null);
  useEffect(() => {
    if (workerRoleIdsRef.current && isFocus) {
      workerRoleIdsRef.current.focus();
    }
  }, [isFocus, workerRoleIdsRef]);

  const [communityList, setCommunityList] = useState<List[]>([]);

  const getCommunityListFn = async () => {
    try {
      const res = await getSuperAdminCommunityList();

      if (res.code == 200) {
        setCommunityList(
          res.data.map((item) => ({ label: item.name, value: item.id }))
        );
      }
    } finally {
    }
  };

  useEffect(() => {
    getCommunityListFn();
  }, []);

  return (
    <div className="relative">
      <CustomForm
        form={form}
        className="py-4 px-6"
        onSubmit={(data) => {
          onSubmit(data);
        }}
      >
        <div className="flex space-x-12 mb-[10px]">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <CustomFormItem label="First Name" required>
                  <CustomInput
                    placeholder="First Name"
                    {...field}
                    disabled={isView}
                  />
                </CustomFormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <CustomFormItem label="Last Name" required>
                  <CustomInput
                    placeholder="Last Name"
                    {...field}
                    disabled={isView}
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
              name="middleName"
              render={({ field }) => (
                <CustomFormItem label="Middle Initial">
                  <CustomInput
                    placeholder="Middle Initial"
                    {...field}
                    disabled={isView}
                  />
                </CustomFormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="externalId"
              render={({ field }) => (
                <CustomFormItem label="External ID">
                  <CustomInput
                    placeholder="External ID"
                    {...field}
                    disabled={isView}
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
              name="email"
              render={({ field }) => (
                <CustomFormItem label="Email Address" required>
                  <CustomInput
                    placeholder="Email Address"
                    {...field}
                    disabled={isView || !!editItem?.email}
                  />
                </CustomFormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="nationalPhone"
              render={({ field }) => (
                <CustomFormItem label="Phone Number" required>
                  <CustomPhoneInput
                    setError={(message = "Invalid phone number.") => {
                      form.setError("nationalPhone", { message });
                    }}
                    placeholder="Phone Number"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (field.value.length === 0) {
                        form.setError("nationalPhone", { message: "" });
                      }
                    }}
                    disabled={isView || !!editItem?.nationalPhone}
                  ></CustomPhoneInput>
                </CustomFormItem>
              )}
            />
          </div>
        </div>
        <div className="flex space-x-12 mb-[10px]">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <CustomFormItem label="License/Credential">
                  <CustomInput
                    placeholder="License/Credential"
                    {...field}
                    disabled={isView}
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
                  required
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <DatePicker
                    value={field.value}
                    allowClear
                    onChange={(date) => {
                      field.onChange({
                        target: {
                          value: date,
                        },
                      });
                    }}
                    placeholder="Hire Date"
                    disabled={isView}
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
                    disabled={isView}
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
                    allowClear
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

        <div className="flex space-x-12 mb-[10px]">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="communityId"
              render={({ field }) => (
                <CustomFormItem label="Community" required>
                  <Select
                    options={communityList}
                    value={field.value}
                    onChange={(data) => {
                      field.onChange(data);
                      if (data) {
                        getAllDepartment(data);
                        getRoleList(data);
                      } else {
                        setWorkerRoleList([]);
                        setDepartmentList([]);
                      }

                      form.setValue("departmentIds", []);
                      form.setValue("workerRoleIds", []);
                    }}
                    isDisabled={isView}
                    isWrap
                    placeholder="Community"
                  />
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
                    isDisabled={isView}
                    options={departmentList}
                    value={field.value}
                    isWrap
                    isMulti
                    menuPlacement="top"
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
              name="workerRoleIds"
              render={({ field }) => (
                <CustomFormItem label="Roles Allowed to Work" required>
                  <Select
                    ref={workerRoleIdsRef}
                    options={workerRoleList}
                    isMulti
                    value={field.value}
                    onChange={field.onChange}
                    isDisabled={isView}
                    isWrap
                    placeholder="Roles Allowed to Work"
                  />
                </CustomFormItem>
              )}
            />
          </div>
          <div className="flex-1"></div>
        </div>

        {/* edit */}
        {!isView && (
          <div className="flex gap-6 justify-end mt-[20px]">
            <CustomButton
              loading={loading}
              type="submit"
              onClick={async () => {
                if (form.getValues("nationalPhone")) {
                  const res = await messageValidatePhoneNumber(
                    form.getValues("nationalPhone").replace(/\s+/g, "")
                  );
                  if (res.code === 200) {
                    if (!res.data.valid) {
                      form.setError("nationalPhone", {
                        message: "Invalid phone number.",
                      });
                    }
                  }
                }
              }}
            >
              Save
            </CustomButton>
          </div>
        )}
      </CustomForm>
    </div>
  );
};
export default EditInfo;
