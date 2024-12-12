import { useState } from "react";
import { toast } from "react-toastify";

import { addUser, editUser } from "@/api/admin/user";
import { UserParams } from "@/api/admin/user/type";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";

import useFormCreate from "../hooks/form";
import { UserVo } from "../types";
// import { SearchParams, UserVo } from "@/api/admin/user/type";

interface CreateDiaProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: UserVo | null;
  onClose: () => void;
  getLsit: () => void;
}

const CreateDia = (props: CreateDiaProps) => {
  const { open, editItem, setOpen, onClose, getLsit } = props;

  const { form } = useFormCreate({
    editItem,
    open,
  });

  const [loading, setLoading] = useState(false);

  const addUserFn = async (data: UserParams) => {
    setLoading(true);
    try {
      const res = await addUser({
        ...data,
        redirectUrl: location.origin,
      });
      if (res.code === 200) {
        toast.success(MESSAGE.create, {
          position: "top-center",
        });
        setOpen(false);
        onClose();
        getLsit();
      }
    } finally {
      setLoading(false);
    }
  };

  const editUserFn = async (data: UserParams) => {
    setLoading(true);
    try {
      const res = await editUser({
        ...data,
        redirectUrl: location.origin,
      });
      if (res.code === 200) {
        toast.success(MESSAGE.edit, {
          position: "top-center",
        });
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
      title={editItem ? "Edit Super Admin" : "Add Super Admin"}
      open={open}
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      <CustomForm
        form={form}
        className="py-4 px-6"
        onSubmit={(data) => {
          if (editItem) {
            editUserFn({
              ...data,
              id: editItem.id,
            });
          } else {
            addUserFn(data);
          }
        }}
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <CustomFormItem label="First Name" required>
              <Input placeholder="First Name" {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <CustomFormItem label="Last Name" required>
              <Input placeholder="Last Name" {...field} />
            </CustomFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <CustomFormItem label="Email Address" required>
              <Input placeholder="Email Address" {...field} />
            </CustomFormItem>
          )}
        />

        <div className="flex gap-6 justify-end mt-10">
          <Button
            onClick={() => {
              setOpen(false);
              onClose();
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>

          <Button loading={loading} type="submit">
            Save & Invite
          </Button>
        </div>
      </CustomForm>
    </CustomDialog>
  );
};
export default CreateDia;
