import { useEffect, useState } from "react";

import { getworkerRoleSelect } from "@/api/employees";
import CustomButton from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import CustomInput from "@/components/custom/Input";
import CustomPhoneInput from "@/components/custom/PhoneInput/phoneInput";
import Select from "@/components/custom/Select";
import { FormField } from "@/components/ui/form";

import useFormCreate from "../hooks/form";
import { EmployeesVo } from "../type";
interface CreateDiaProps {
  communityId?: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: EmployeesVo | null;
  onClose: () => void;
}
const CreateDia = (props: CreateDiaProps) => {
  const { open, editItem, setOpen, onClose, communityId } = props;
  if (editItem) {
    const { roles, departments }: any = editItem;
    editItem.workerRoleIds = roles.map((item: { id: string }) => item.id);
    editItem.departmentIds = departments.map(
      (item: { deptId: string }) => item.deptId
    );
  }
  const [workerRoleList, setWorkerRoleList] = useState([]);
  const { form } = useFormCreate({ editItem, open });
  const getRoleList = async (data: string) => {
    try {
      const res = await getworkerRoleSelect(data);
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
  useEffect(() => {
    if (communityId) {
      getRoleList(communityId);
    }
  }, [communityId]);
  return (
    <CustomDialog
      title="View Employee"
      open={open}
      width="860px"
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      <CustomForm form={form} className="py-4 px-6" onSubmit={(data) => {}}>
        <div className="text-[#324664] font-[390] text-[16px] mb-[10px]">
          Please enter either Email or Phone or both
          <span className="text-[#EB1DB2] ml-[5px]">*</span>
        </div>
        <div className="flex space-x-12 mb-[10px]">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <CustomFormItem label="Email Address">
                  <CustomInput
                    placeholder="Email Address"
                    {...field}
                    disabled={editItem ? true : false}
                  />
                </CustomFormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <CustomFormItem label="Phone Number">
                  <CustomPhoneInput
                    setError={(message = "Invalid phone number.") => {
                      form.setError("phone", { message });
                    }}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (field.value.length === 0) {
                        form.setError("phone", { message: "" });
                      }
                    }}
                    placeholder="Phone Number"
                    disabled={editItem ? true : false}
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
                <CustomFormItem label="Roles allowed to work" required>
                  <Select
                    options={workerRoleList}
                    value={field.value}
                    onChange={field.onChange}
                    isMulti
                    isWrap
                    isDisabled
                    placeholder="Roles allowed to work"
                  />
                </CustomFormItem>
              )}
            />
          </div>
          <div className="flex-1"></div>
        </div>
        <div className="flex gap-6 justify-end">
          <CustomButton
            onClick={() => {
              setOpen(false);
              onClose();
            }}
            variant="outline"
          >
            Cancel
          </CustomButton>
        </div>
      </CustomForm>
    </CustomDialog>
  );
};
export default CreateDia;
