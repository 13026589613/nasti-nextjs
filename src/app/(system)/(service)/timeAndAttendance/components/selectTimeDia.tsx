import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Button from "@/components/custom/Button";
import DatePicker from "@/components/custom/DatePicker";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import TimePicker from "@/components/custom/TimePicker";
import { FormField } from "@/components/ui/form";
import useGlobalTime from "@/hooks/useGlobalTime";

import { ExceptionsDetail } from "../types";

/**
 * @description Form Props
 */
interface ApproveDiaProps {
  open: boolean;
  data: ExceptionsDetail;
  onClose: () => void;
  onSuccessful: (time: string) => void;
}

/**
 * @description Form Dialog
 */
const SelectTimeDia = (props: ApproveDiaProps) => {
  const { open, data, onClose, onSuccessful } = props;

  const { UTCMoment, localMoment } = useGlobalTime();

  const [loading, setLoading] = useState(false);

  const FormSchema = z.object({
    date: z.string().min(1, "This field is required."),
    time: z.string().min(1, "This field is required."),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { reset, handleSubmit } = form;

  useEffect(() => {
    reset();
  }, [open]);

  const [label, setLabel] = useState<string>("");
  useEffect(() => {
    const { attendeeType, checkInUtc, checkOutUtc } = data;

    if (attendeeType === "CHECK_IN") {
      setLabel("Check-in Time");
      if (checkInUtc) {
        form.setValue("date", UTCMoment(checkInUtc).format("MM/DD/YYYY"));
        form.setValue("time", UTCMoment(checkInUtc).format("hh:mm A"));
      }
    }
    if (attendeeType === "CHECK_OUT") {
      setLabel("Check-out Time");
      if (checkOutUtc) {
        form.setValue("date", UTCMoment(checkOutUtc).format("MM/DD/YYYY"));
        form.setValue("time", UTCMoment(checkOutUtc).format("hh:mm A"));
      }
    }
  }, [data]);

  const onSubmit = async ({ date, time }: { date: string; time: string }) => {
    setLoading(true);
    try {
      await onSuccessful(
        localMoment(`${date} ${time}`, "MM/DD/YYYY hh:mm A").format(
          "MM/DD/YYYY HH:mm:ss"
        )
      );
    } finally {
      setLoading(false);
    }
  };
  // Dialog Form
  return (
    <>
      <CustomDialog
        title={"Edit"}
        open={open}
        onClose={() => {
          onClose && onClose();
        }}
      >
        <CustomForm form={form} onSubmit={(data) => {}}>
          <div>
            <div
              className={"mr-4 leading-10 text-left font-[390] text-[#324664]"}
            >
              {label}
              <span className="ml-[5px] font-[390] text-[16px] text-[var(--primary-color)]">
                *
              </span>
            </div>
          </div>
          <div className="flex justify-between gap-[10px] w-full">
            <div className="w-[calc(50%-5px)]">
              <FormField
                control={form.control}
                name="date"
                rules={{ required: "This field is required." }}
                render={({ field }) => {
                  const { value, onChange } = field;
                  return (
                    <CustomFormItem
                      label=""
                      required
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <DatePicker
                        value={value}
                        onChange={(value) => {
                          if (value) {
                            form.clearErrors("date");
                          }
                          onChange(value);
                        }}
                        allowClear={false}
                        placeholder="Select Date"
                      />
                    </CustomFormItem>
                  );
                }}
              />
            </div>
            <div className="w-[calc(50%-5px)]">
              <FormField
                control={form.control}
                name="time"
                rules={{ required: "This field is required." }}
                render={({ field }) => {
                  const { value, onChange } = field;
                  return (
                    <CustomFormItem
                      label=""
                      required
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <TimePicker
                        value={value}
                        onChange={(data) => {
                          onChange(data);
                          if (value) {
                            form.clearErrors("time");
                          }
                        }}
                        placeholder="Select Time"
                      />
                    </CustomFormItem>
                  );
                }}
              />
            </div>
          </div>
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

          <Button
            loading={loading}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            Save
          </Button>
        </div>
      </CustomDialog>
    </>
  );
};
export default SelectTimeDia;
