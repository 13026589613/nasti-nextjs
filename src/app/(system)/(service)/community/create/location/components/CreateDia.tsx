import { useState } from "react";
import { toast } from "react-toastify";

import { addLocation, editLocation } from "@/api/location";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";

import useFormCreate from "../hooks/form";
import { AddLocationParams, EditLocationParams, LocationVo } from "../types";

/**
 * @description Form Props
 */
interface CreateDiaProps {
  communityId: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: LocationVo | null;
  onClose: () => void;
  getLsit: () => void;
}

/**
 * @description Form Dialog
 */
const CreateDia = (props: CreateDiaProps) => {
  const { communityId } = props;
  const { open, editItem, setOpen, onClose, getLsit } = props;
  const { form } = useFormCreate({ editItem, open });
  const [loading, setLoading] = useState(false);

  // Form Add Info
  const addLocationFn = async (data: AddLocationParams) => {
    setLoading(true);
    try {
      data.communityId = communityId;

      const res = await addLocation(data);
      if (res.code === 200) {
        toast.success(MESSAGE.create);
        setOpen(false);
        onClose();
        getLsit();
      }
    } finally {
      setLoading(false);
    }
  };

  // Form Edit Info
  const editLocationFn = async (data: EditLocationParams) => {
    setLoading(true);
    try {
      data.communityId = communityId;
      const res = await editLocation(data);
      if (res.code === 200) {
        toast.success(MESSAGE.edit);
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
      title={editItem ? "Edit Location" : "Add Location"}
      open={open}
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      {/* Form - Location */}
      <CustomForm
        form={form}
        className="pt-0 pb-4 px-6"
        onSubmit={(data) => {
          if (editItem) {
            editLocationFn({
              ...data,
              id: editItem.id,
            });
          } else {
            addLocationFn(data);
          }
        }}
      >
        {/* Form Field - $column.javaField */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <CustomFormItem label="Location Name" required>
              <Input placeholder="Location Name" {...field} />
            </CustomFormItem>
          )}
        />
        <div className="h-[15px]"></div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <CustomFormItem label="Location Description">
              <Textarea
                className="placeholder:text-[#919FB4]"
                placeholder="Location Description"
                {...field}
              />
            </CustomFormItem>
          )}
        />

        {/* Dialog Form Btn‘s */}
        <div className="flex gap-6 justify-end mt-6">
          <Button
            type="button"
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
