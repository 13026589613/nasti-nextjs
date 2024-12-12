import { useState } from "react";

import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import CustomSelect from "@/components/custom/Select";
import { FormField } from "@/components/ui/form";

import useFormCreate from "../hooks/useFormHook";

interface SelectDiaProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}
const SelectDia = (props: SelectDiaProps) => {
  const { open, setOpen } = props;
  const { form } = useFormCreate({ open });
  const [loading, _setLoading] = useState(false);
  const [options, _setOptions] = useState([
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
    {
      label: "Community 1",
      value: "1",
    },
  ]);
  return (
    <CustomDialog
      title={"Select Community"}
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <CustomForm
        form={form}
        className="py-4 px-6"
        onSubmit={(data) => {
          setOpen(false);
        }}
      >
        <FormField
          control={form.control}
          name="communityId"
          render={({ field }) => (
            <CustomFormItem label="Community" required>
              {/* <Input placeholder="Place Enter Name." {...field} /> */}
              <CustomSelect
                menuWrapperClass="relative"
                options={options}
                {...field}
              ></CustomSelect>
            </CustomFormItem>
          )}
        />

        <div className="flex gap-6 justify-end mt-10">
          <Button
            onClick={() => {
              setOpen(false);
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
export default SelectDia;
