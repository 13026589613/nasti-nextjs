import { zodResolver } from "@hookform/resolvers/zod";
import { useSetState } from "ahooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import {
  applyTemplate,
  scheduleTemplateListOption,
} from "@/api/currentSchedule";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import CustomSelect from "@/components/custom/Select";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";

const FormSchema = z.object({
  templateId: z.string().min(1, { message: "This field is required." }),
});

interface SelectTemplateDiaProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  applyInfo: {
    communityId: string;
    departmentId: string;
    shiftStartDate: string;
    shiftEndDate: string;
    scheduleId?: string | null;
  };
  hasShift: boolean;
  onSuccess: () => void;
}

const SelectTemplateDia = (props: SelectTemplateDiaProps) => {
  const { open, applyInfo, hasShift, setOpen, onSuccess } = props;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const applyTemplateFn = async (type: 0 | 1) => {
    setConfirmApply({
      loading: true,
    });
    try {
      const res = await applyTemplate({
        ...applyInfo,
        type,
        templateId: form.getValues("templateId") as string,
      });
      if (res.code == 200) {
        toast.success(MESSAGE.apply, {
          position: "top-center",
        });
        setOpen(false);
        setConfirmApply({
          visible: false,
          loading: false,
        });
        onSuccess();
      }
    } finally {
      setConfirmApply({
        loading: false,
      });
    }
  };
  // Dialog Form
  const [confirmApply, setConfirmApply] = useSetState({
    visible: false,
    loading: false,
  });

  const [templateList, setTemplateList] = useState<any[]>([]);
  const [loadList, setLoadList] = useState(false);

  const getTemplateList = async () => {
    setLoadList(true);
    try {
      const res = await scheduleTemplateListOption({
        communityId: applyInfo.communityId,
        departmentId: applyInfo.departmentId,
      });
      if (res.code == 200) {
        setTemplateList(
          res.data.map((item) => ({
            label: item.name,
            value: item.id,
          }))
        );
      }
    } finally {
      setLoadList(false);
    }
  };

  useEffect(() => {
    if (open) {
      getTemplateList();
    }
  }, [open]);

  return (
    <>
      <CustomDialog
        title={"Select Template"}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <CustomForm
          form={form}
          className="py-4"
          onSubmit={() => {
            if (hasShift) {
              setConfirmApply({
                visible: true,
              });
            } else {
              applyTemplateFn(0);
            }
          }}
        >
          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <CustomFormItem label="Template" required>
                <CustomSelect
                  {...field}
                  isLoading={loadList}
                  isSearchable
                  options={templateList}
                ></CustomSelect>
              </CustomFormItem>
            )}
          />
          {/* Dialog Form Btn‘s */}
          <div className="flex gap-6 justify-end mt-5">
            <Button
              onClick={() => {
                setOpen(false);
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>

            <Button type="submit">Apply</Button>
          </div>
        </CustomForm>

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
              You already have shifts scheduled for this week. Do you want to
              keep the current shifts or do you want to overwrite the shifts
              with the template?
            </div>
          </ConfirmDialog>
        )}
      </CustomDialog>
    </>
  );
};

export default SelectTemplateDia;
