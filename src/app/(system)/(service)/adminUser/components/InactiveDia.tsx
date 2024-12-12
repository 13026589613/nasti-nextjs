import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import { inactiveAdminUser } from "@/api/adminUser";
import Button from "@/components/custom/Button";
import DatePicker from "@/components/custom/DatePicker";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";

/**
 * @description Form Props
 */
interface CreateDiaProps {
  open: boolean;
  id: string;
  onClose: (isRefresh?: boolean) => void;
}

const FormSchema = z.object({
  terminationDate: z.string().min(1, {
    message: "This field is required.",
  }),
});

/**
 * @description Form Dialog
 */
const InactiveDia = (props: CreateDiaProps) => {
  const { id, open, onClose } = props;
  const [loading, setLoading] = useState(false);

  const inactiveUser = async (terminationDate: string) => {
    setLoading(true);
    try {
      const res = await inactiveAdminUser({
        id,
        terminationDate: moment(terminationDate).format("MM/DD/YYYY"),
      });
      if (res.code === 200) {
        toast.success(MESSAGE.deactivate, {
          position: "top-center",
        });
        onClose(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { errors } = form.formState;
  useEffect(() => {
    if (errors.terminationDate) {
      form.setError("terminationDate", {
        type: "manual",
        message: "This field is required.",
      });
    }
  }, [errors]);

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open]);

  // Dialog Form
  return (
    <CustomDialog
      title={"Deactivate Admin User"}
      open={open}
      onClose={() => {
        onClose();
      }}
    >
      <div className="w-full">
        <CustomForm
          form={form}
          onSubmit={(data) => {
            inactiveUser(data.terminationDate);
          }}
        >
          <FormField
            control={form.control}
            name="terminationDate"
            render={({ field }) => (
              <CustomFormItem
                label=" Please enter the termination date"
                required
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
                  allowClear={false}
                  placeholder="Termination Date"
                  disabledDate={(current) => {
                    return current && current > moment().startOf("day");
                  }}
                  isShowNow={true}
                ></DatePicker>
              </CustomFormItem>
            )}
          />
          <div className="flex justify-end gap-[24px] mt-5">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button loading={loading}>Save</Button>
          </div>
        </CustomForm>
      </div>
    </CustomDialog>
  );
};
export default InactiveDia;
