import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import { FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type BtnType = "remove" | "new" | "cover";
interface ApproveRadioDiaProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSuccessful: (type: BtnType) => Promise<void>;
}

const ApproveRadioDia = (props: ApproveRadioDiaProps) => {
  const { open, loading, onClose, onSuccessful } = props;

  const FormSchema = z.object({
    type: z.string().min(1, {
      message: "This field is required.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: "remove",
    },
  });

  const { reset } = form;

  useEffect(() => {
    reset();
  }, [open]);

  const onSubmit = async () => {
    onSuccessful(form.getValues().type as BtnType);
  };
  // Dialog Form
  return (
    <>
      <CustomDialog
        title={"Confirmation"}
        open={open}
        onClose={() => {
          onClose && onClose();
        }}
      >
        <CustomForm form={form} onSubmit={(data) => {}}>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <CustomFormItem
                label="Please select what you want to do with the remaining hours:"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <RadioGroup className="gap-0" {...field}>
                  <div className="flex items-center space-x-2 h-10">
                    <RadioGroupItem
                      className={cn(
                        field.value !== "remove" && "border-[#E2E8F0]"
                      )}
                      onClick={() => {
                        field.onChange({
                          target: { value: "remove" },
                        });
                      }}
                      value="remove"
                    />
                    <Label
                      className="text-[#919FB4] text-[16px] font-[390]"
                      onClick={() => {
                        field.onChange({
                          target: { value: "remove" },
                        });
                      }}
                    >
                      Do not schedule the remaining hours
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 h-10">
                    <RadioGroupItem
                      className={cn(
                        field.value !== "new" && "border-[#E2E8F0]"
                      )}
                      onClick={() => {
                        field.onChange({
                          target: { value: "new" },
                        });
                      }}
                      value="new"
                    />
                    <Label
                      className="text-[#919FB4] text-[16px] font-[390]"
                      onClick={() => {
                        field.onChange({
                          target: { value: "new" },
                        });
                      }}
                    >
                      Create a new open shift for the remaining hours
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 h-10">
                    <RadioGroupItem
                      className={cn(
                        field.value !== "cover" && "border-[#E2E8F0]"
                      )}
                      onClick={() => {
                        field.onChange({
                          target: { value: "cover" },
                        });
                      }}
                      value="cover"
                    />
                    <Label
                      className="text-[#919FB4] text-[16px] font-[390]"
                      onClick={() => {
                        field.onChange({
                          target: { value: "cover" },
                        });
                      }}
                    >
                      Adjust other shifts to cover the remaining hours
                    </Label>
                  </div>
                </RadioGroup>
              </CustomFormItem>
            )}
          />
        </CustomForm>
        {/* Dialog Form Btn‘s */}
        <div className="flex gap-6 justify-end mt-5">
          <Button
            onClick={() => {
              onClose && onClose();
            }}
            variant="outline"
            loading={loading}
          >
            Cancel
          </Button>

          <Button loading={loading} onClick={onSubmit} type="submit">
            Confirm
          </Button>
        </div>
      </CustomDialog>
    </>
  );
};

export default ApproveRadioDia;
