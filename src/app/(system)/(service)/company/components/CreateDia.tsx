import { useState } from "react";

import { addCompany, editCompany } from "@/api/company";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";

import useFormCreate from "../hooks/form";
import { AddCompanyParams, CompanyVo, EditCompanyParams } from "../types";

/**
 * @description Form Props
 */
interface CreateDiaProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: CompanyVo | null;
  onClose: () => void;
  getLsit: () => void;
}

/**
 * @description Form Dialog
 */
const CreateDia = (props: CreateDiaProps) => {
  const { open, editItem, setOpen, onClose, getLsit } = props;
  const { form } = useFormCreate({ editItem, open });
  const [loading, setLoading] = useState(false);

  // Form Add Info
  const addCompanyFn = async (data: AddCompanyParams) => {
    setLoading(true);
    try {
      const res = await addCompany(data);
      if (res.code === 200) {
        setOpen(false);
        onClose();
        getLsit();
      }
    } finally {
      setLoading(false);
    }
  };

  // Form Edit Info
  const editCompanyFn = async (data: EditCompanyParams) => {
    setLoading(true);
    try {
      const res = await editCompany(data);
      if (res.code === 200) {
        setOpen(false);
        onClose();
        getLsit();
      }
    } finally {
      setLoading(false);
    }
  };

  // Dialog Form
  return (
    <CustomDialog
      title={editItem ? "Edit" : "Create"}
      open={open}
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      {/* Form - Company */}
      <CustomForm
        form={form}
        className="py-4 px-6"
        onSubmit={(data) => {
          if (editItem) {
            editCompanyFn({
              ...data,
              id: editItem.id,
            });
          } else {
            addCompanyFn(data);
          }
        }}
      >
        {/* Form Field - $column.javaField */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <CustomFormItem label="name" required>
              <Input placeholder="Name." {...field} />
            </CustomFormItem>
          )}
        />

        {/* Dialog Form Btn‘s */}
        <div className="flex gap-6 justify-end">
          <Button
            onClick={() => {
              setOpen(false);
              onClose();
            }}
            variant="outline"
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
