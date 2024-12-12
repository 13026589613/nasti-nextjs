import { zodResolver } from "@hookform/resolvers/zod";
import { useSetState } from "ahooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import {
  applyTemplate,
  scheduleShiftTemplatePreCheck,
} from "@/api/currentSchedule";
import CustomButton from "@/components/custom/Button";
import DateWeekPicker from "@/components/custom/DatePicker/week/dateWeekPicker";
import Dialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import { FormItem, FormLabel } from "@/components/FormComponent";
import { MESSAGE } from "@/constant/message";

type ApplyTemplateDialogProps = {
  onClose: () => void;
  currentItem: any;
  onSuccess?: () => void;
  communityId: string;
  departmentId: string;
  type?: 0 | 1;
};

const FormSchema = z.object({
  weekDate: z.string().min(1, {
    message: "This field is required.",
  }),
});

type FormDataType = z.infer<typeof FormSchema>;
const ApplyTemplateDialog = (props: ApplyTemplateDialogProps) => {
  const { onClose, onSuccess, communityId, departmentId, currentItem } = props;

  const [submitLoading, setSubmitLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      weekDate: "",
    },
  });
  const { control, handleSubmit } = form;

  const { errors } = form.formState;

  const onSubmit = async (formData: FormDataType) => {
    try {
      setSubmitLoading(true);
      const { data, code } = await scheduleShiftTemplatePreCheck({
        communityId: communityId,
        departmentId: departmentId,
        shiftStartDate: dateRange && dateRange[0],
        shiftEndDate: dateRange && dateRange[1],
      });
      if (code == 200) {
        if (data.existsData && !data.existsPublishData) {
          setConfirmApply({
            visible: true,
          });
        } else if (data.existsPublishData) {
          toast.warning(
            "A template cannot be applied to a week that already has a published schedule."
          );
        } else {
          applyTemplateFn(0);
        }
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const applyTemplateFn = async (type: 0 | 1) => {
    setConfirmApply({
      loading: true,
    });
    try {
      const res = await applyTemplate({
        communityId: communityId,
        departmentId: departmentId,
        shiftStartDate: dateRange && dateRange[0],
        shiftEndDate: dateRange && dateRange[1],
        templateId: currentItem?.id,
        type,
      });
      if (res.code == 200) {
        toast.success(MESSAGE.apply, {
          position: "top-center",
        });
        setConfirmApply({
          visible: false,
          loading: false,
        });
        onClose();
        onSuccess && onSuccess();
      }
    } finally {
      setConfirmApply({
        loading: false,
      });
    }
  };

  const [confirmApply, setConfirmApply] = useSetState({
    visible: false,
    loading: false,
  });

  return (
    <Dialog
      open
      width="517px"
      title="Select Week"
      onClose={onClose}
      footer={
        <div>
          <CustomButton
            onClick={onClose}
            variant={"outline"}
            className="w-[110px]"
            disabled={submitLoading}
          >
            Cancel
          </CustomButton>
          <CustomButton
            loading={submitLoading}
            className="w-[110px] ml-[22px]"
            onClick={handleSubmit(onSubmit)}
          >
            Save
          </CustomButton>
        </div>
      }
    >
      <FormLabel
        label="Please select the week that you want to apply this template to:"
        required
      >
        <FormItem
          name="weekDate"
          control={control}
          errors={errors.weekDate}
          render={({ field }) => (
            <DateWeekPicker
              value={field.value}
              isShowNow={true}
              onChange={(date) => {
                field.onChange({
                  target: {
                    value: date,
                  },
                });
              }}
              dateRange={(date: any) => {
                setDateRange(date);
              }}
              // disabledDate={(current) => {
              //   return current.isBefore(localMoment(), "day");
              // }}
              placeholder="Select Week"
            />
          )}
          rules={{ required: "This field is required." }}
        />
      </FormLabel>
      {confirmApply.visible && (
        <ConfirmDialog
          open={confirmApply.visible}
          btnLoading={confirmApply.loading}
          middleButton={true}
          width="521px"
          onClose={() => {
            setConfirmApply({
              visible: false,
            });
          }}
          onOk={() => {
            applyTemplateFn(1);
          }}
          onMiddleButton={() => {
            applyTemplateFn(0);
          }}
          okText="Keep Shifts"
          middleButtonText="Remove Shifts"
        >
          <div className="text-[16px] font-[390] text-[#324664] leading-10">
            You already have shifts scheduled for this week. Do you want to keep
            the current shifts or do you want to overwrite the shifts with the
            template?
          </div>
        </ConfirmDialog>
      )}
    </Dialog>
  );
};
export default ApplyTemplateDialog;
