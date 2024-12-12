import { useState } from "react";

import { addTypeDictinary, editTypeDictinary } from "@/api/dictionary";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";

import useFormCreate from "../hooks/form";
import {
  AddTypeDictinaryParams,
  DictinaryVo,
  EditTypeDictinaryParams,
} from "../type";
interface CreateDiaProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: DictinaryVo | null;
  onClose: () => void;
  getLsit: () => void;
}
const CreateDia = (props: CreateDiaProps) => {
  const { open, editItem, setOpen, onClose, getLsit } = props;
  const { form } = useFormCreate({ editItem, open });
  const [loading, setLoading] = useState(false);
  const addTypeDictinaryFn = async (data: AddTypeDictinaryParams) => {
    setLoading(true);
    try {
      const res = await addTypeDictinary(data);
      if (res.code === 200) {
        setOpen(false);
        onClose();
        getLsit();
      }
    } finally {
      setLoading(false);
    }
  };
  const editTypeDictinaryFn = async (data: EditTypeDictinaryParams) => {
    setLoading(true);
    try {
      const res = await editTypeDictinary(data);
      if (res.code === 200) {
        setOpen(false);
        onClose();
        getLsit();
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <CustomDialog
      title={editItem ? "Edit" : "Create"}
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
            editTypeDictinaryFn({
              ...data,
              id: editItem.id,
            });
          } else {
            addTypeDictinaryFn(data);
          }
        }}
      >
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <CustomFormItem label="Name" required>
              <Input placeholder="Name" {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <CustomFormItem label="Type" required>
              <Input placeholder="Type" {...field} />
            </CustomFormItem>
          )}
        />
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
