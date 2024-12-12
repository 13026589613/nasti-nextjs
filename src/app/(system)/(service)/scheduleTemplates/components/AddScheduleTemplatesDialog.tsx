import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import {
  duplicateScheduleTemplate,
  scheduleTemplateCreate,
} from "@/api/scheduleTemplates";
import { GetScheduleTemplateListRecord } from "@/api/scheduleTemplates/types";
import CustomButton from "@/components/custom/Button";
import Dialog from "@/components/custom/Dialog";
import Input from "@/components/custom/Input";
import { FormItem, FormLabel } from "@/components/FormComponent";
import { MESSAGE } from "@/constant/message";
import useDepartmentStore from "@/store/useDepartmentStore";

type AddScheduleTemplatesDialogProps = {
  onClose: () => void;
  copyItem: GetScheduleTemplateListRecord | null;
  onSuccess?: () => void;
  communityId: string;
  departmentId: string;
};

const FormSchema = z.object({
  name: z.string().min(1, {
    message: "This field is required.",
  }),
});

type FormDataType = z.infer<typeof FormSchema>;
const AddScheduleTemplatesDialog = (props: AddScheduleTemplatesDialogProps) => {
  const { onClose, onSuccess, communityId, departmentId, copyItem } = props;

  const [submitLoading, setSubmitLoading] = useState(false);

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: copyItem ? copyItem.name : "",
    },
  });

  const { control, handleSubmit } = form;

  const { errors } = form.formState;

  const copyItemFn = async (name: string) => {
    try {
      const res = await duplicateScheduleTemplate({
        id: copyItem?.id || "",
        name: name,
      });
      if (res.code === 200) {
        toast.success(MESSAGE.copy, {
          position: "top-center",
        });
        onSuccess && onSuccess();

        onClose();
      }
    } finally {
      setSubmitLoading(false);
    }
  };
  const onSubmit = (formData: FormDataType) => {
    setSubmitLoading(true);
    if (copyItem?.id) {
      copyItemFn(formData.name);
    } else {
      scheduleTemplateCreate({
        ...formData,
        communityId: communityId,
        departmentId: departmentId,
      })
        .then(({ code, data }) => {
          if (code !== 200) return;

          toast.success(MESSAGE.create, {
            position: "top-center",
          });

          onClose();

          onSuccess && onSuccess();

          router.push(
            `/scheduleTemplates/edit?type=edit&templateId=${data}&departmentId=${departmentId}`
          );
          useDepartmentStore
            .getState()
            .setDepartment([departmentId], "/scheduleTemplates/edit");
        })
        .finally(() => setSubmitLoading(false));
    }
  };

  return (
    <Dialog
      open
      width="517px"
      title={copyItem ? "Duplicate Template" : "Add Schedule Template"}
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
        label={copyItem ? "Rename Template Name" : "Template Name"}
        required
      >
        <FormItem
          name="name"
          control={control}
          errors={errors.name}
          render={({ field }) => (
            <Input placeholder="Template Name" {...field} />
          )}
          rules={{ required: "This field is required." }}
        />
      </FormLabel>
    </Dialog>
  );
};
export default AddScheduleTemplatesDialog;
