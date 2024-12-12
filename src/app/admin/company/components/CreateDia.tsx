import { useState } from "react";
import { toast } from "react-toastify";

import { createCompany, editCompany } from "@/api/admin/company";
import { CompanyVo } from "@/api/admin/company/type";
import { CompanyParams } from "@/api/admin/company/type";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";

import useFormCreate from "../hooks/form";
interface CreateDiaProps {
  open: boolean;
  editItem: CompanyVo | null;
  setOpen: (value: boolean) => void;
  onClose: () => void;
  getList: () => void;
}

const CreateDia = (props: CreateDiaProps) => {
  const { open, editItem, setOpen, onClose, getList } = props;
  const { form } = useFormCreate({ editItem, open });
  const [loading, setLoading] = useState(false);

  const editCompanyFn = async (data: CompanyParams) => {
    setLoading(true);
    try {
      const res = await editCompany(data);
      if (res.code === 200 && res.data) {
        toast.success(MESSAGE.edit, { position: "top-center" });
        setOpen(false);
        onClose();
        getList();
      }
    } finally {
      setLoading(false);
    }
  };

  const addCompanyFn = async (data: CompanyParams) => {
    setLoading(true);
    try {
      const res = await createCompany({ ...data, isActive: true });
      if (res.code === 200 && res.data) {
        toast.success(MESSAGE.create, { position: "top-center" });
        setOpen(false);
        onClose();
        getList();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog
      title={editItem ? "Edit Company" : "Add Company"}
      open={open}
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      <CustomForm
        form={form}
        className="pt-0 pb-4 px-6"
        onSubmit={(data) => {
          if (editItem) {
            editCompanyFn({
              name: data.name,
              isActive: editItem.isActive,
              id: editItem.id,
            });
          } else {
            addCompanyFn(data);
          }
        }}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <CustomFormItem label="Company Name" required>
              <Input placeholder="Company Name" {...field} />
            </CustomFormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="createdAt"
          render={({ field }) => (
            <CustomFormItem label="Created Date" required>
              <Input
                placeholder="Created Date"
                {...field}
                value={`${localMoment(field.value).format("MM/DD/YYYY")}`}
                disabled
              />
            </CustomFormItem>
          )}
        /> */}

        <div className="flex gap-6 justify-end mt-10">
          <Button
            onClick={() => {
              setOpen(false);
              onClose();
            }}
            variant="outline"
            type="button"
          >
            Cancel
          </Button>
          <Button loading={loading} type="submit">
            Save
          </Button>
        </div>
      </CustomForm>
    </CustomDialog>
  );
};
export default CreateDia;
