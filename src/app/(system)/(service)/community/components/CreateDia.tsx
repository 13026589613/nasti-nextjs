import { useState } from "react";

import { addCommunity, editCommunity } from "@/api/community";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";

import useFormCreate from "../hooks/form";
import { AddCommunityInput, CommunityVo, EditCommunityInput } from "../types";

/**
 * @description Form Props
 */
interface CreateDiaProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: CommunityVo | null;
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
  const addCommunityFn = async (data: AddCommunityInput) => {
    setLoading(true);
    try {
      const res = await addCommunity(data);
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
  const editCommunityFn = async (data: EditCommunityInput) => {
    setLoading(true);
    try {
      const res = await editCommunity(data);
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
      {/* Form - Community */}
      <CustomForm
        form={form}
        className="py-4 px-6"
        onSubmit={(data) => {
          if (editItem) {
            editCommunityFn({
              ...data,
              id: editItem.id,
            });
          } else {
            addCommunityFn(data);
          }
        }}
      >
        {/* Form Field - $column.javaField */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <CustomFormItem label="Name" required>
              <Input placeholder="Name." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startOfWeek"
          render={({ field }) => (
            <CustomFormItem label="StartOfWeek" required>
              <Input placeholder="StartOfWeek." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="physicalAddress"
          render={({ field }) => (
            <CustomFormItem label="physicalAddress" required>
              <Input placeholder="PhysicalAddress." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="physicalCity"
          render={({ field }) => (
            <CustomFormItem label="physicalCity" required>
              <Input placeholder="PhysicalCity." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="physicalState"
          render={({ field }) => (
            <CustomFormItem label="physicalState" required>
              <Input placeholder="PhysicalState." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="physicalZip"
          render={({ field }) => (
            <CustomFormItem label="physicalZip" required>
              <Input placeholder="PhysicalZip." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mailingAddress"
          render={({ field }) => (
            <CustomFormItem label="mailingAddress" required>
              <Input placeholder="MailingAddress." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mailingCity"
          render={({ field }) => (
            <CustomFormItem label="mailingCity" required>
              <Input placeholder="MailingCity." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mailingState"
          render={({ field }) => (
            <CustomFormItem label="mailingState" required>
              <Input placeholder="MailingState." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mailingZip"
          render={({ field }) => (
            <CustomFormItem label="mailingZip" required>
              <Input placeholder="MailingZip." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billingContact"
          render={({ field }) => (
            <CustomFormItem label="billingContact" required>
              <Input placeholder="BillingContact." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billingEmail"
          render={({ field }) => (
            <CustomFormItem label="billingEmail" required>
              <Input placeholder="BillingEmail." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attendanceEnabled"
          render={({ field }) => (
            <CustomFormItem label="attendanceEnabled" required>
              <Input placeholder="AttendanceEnabled." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locationLat"
          render={({ field }) => (
            <CustomFormItem label="locationLat" required>
              <Input placeholder="LocationLat." {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locationLng"
          render={({ field }) => (
            <CustomFormItem label="locationLng" required>
              <Input placeholder="LocationLng." {...field} />
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
