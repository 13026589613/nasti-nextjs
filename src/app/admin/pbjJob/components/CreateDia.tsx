import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { addPbjJob, editPbjJob } from "@/api/admin/pbjJob/index";
import {
  existsCode,
  existsName,
  listPbjCatrgoty,
} from "@/api/admin/pbjJob/index";
import { PbjJobParams } from "@/api/admin/pbjJob/type";
import { OptionType } from "@/components/custom/AddSelect";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomInput from "@/components/custom/Input";
import Select from "@/components/custom/Select";
import { FormItem, FormLabel } from "@/components/FormComponent";
import { MESSAGE } from "@/constant/message";

import { PbjJobVo } from "../types";

interface CreateDiaProps {
  type: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: PbjJobVo | null;
  onClose: () => void;
  getLsit: () => void;
  categoryTransitionList?: OptionType[];
  categoryName: string;
}

interface List {
  label: string;
  value: string;
  __isNew__?: boolean;
}

const CreateDia = (props: CreateDiaProps) => {
  const {
    open,
    type,
    editItem,
    setOpen,
    onClose,
    getLsit,
    categoryTransitionList,
    categoryName,
  } = props;

  const [loading, setLoading] = useState(false);
  const [categoryCodeDataList, setcategoryCodeDataList] = useState<List[]>([]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    trigger,
  } = useForm<any>({
    defaultValues: {
      name: "",
      categoryList: [{ code: "", name: "" }],
    },
  });

  const handleJobName = () => {
    trigger(["name"]);
  };

  const handleJobCode = () => {
    trigger(["code"]);
  };

  const validateJobName = async (e: string) => {
    if (e) {
      try {
        const { code, data } = await existsName({
          id: editItem ? editItem?.id : null,
          name: e,
        });
        if (code === 200) {
          if (data) {
            return "This job name already exists.";
          }
          return true;
        }
        return true;
      } finally {
      }
    }
    return true;
  };

  const validateJobCode = async (e: string) => {
    if (e) {
      try {
        const { code, data } = await existsCode({
          id: editItem ? editItem?.id : null,
          code: e,
        });
        if (code === 200) {
          if (data) {
            return "This job code already exists.";
          }
          return true;
        }
        return true;
      } finally {
      }
    }
    return true;
  };

  const addPbjJobFn = async (data: PbjJobParams) => {
    let params = {
      name: data.name,
      code: data.code,
      categoryId: data.categoryCode || "",
    };

    setLoading(true);
    try {
      const res = await addPbjJob(params);
      if (res.code === 200) {
        setOpen(false);
        onClose();
        getLsit();
        toast.success(MESSAGE.create, { position: "top-center" });
      }
    } finally {
      setLoading(false);
    }
  };

  const editPbjJobFn = async (data: PbjJobParams) => {
    let params = {
      name: data.name,
      code: data.code,
      id: editItem?.id || "",
      categoryId: data.categoryCode || "",
    };

    setLoading(true);
    try {
      const res = await editPbjJob(params);
      if (res.code === 200) {
        setOpen(false);
        onClose();
        getLsit();
        toast.success(MESSAGE.edit, { position: "top-center" });
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategroyCodeList = async (name: string) => {
    try {
      if (name) {
        const { code, data } = await listPbjCatrgoty(name);
        if (code === 200) {
          let list = data.map((item: any) => {
            return {
              label: item.code,
              value: item.id,
              __isNew__: false,
            };
          });
          if (list.length === 1) {
            setValue("categoryCode", list?.[0].value);
          }
          setcategoryCodeDataList(list);
        }
      }
    } finally {
    }
  };

  const submit = async (param: any) => {
    if (editItem) {
      editPbjJobFn({
        ...param,
        id: editItem.id,
      });
    } else {
      addPbjJobFn(param);
    }
  };

  useEffect(() => {
    reset({
      name: editItem?.name,
      code: editItem?.code,
      categoryName: editItem ? editItem.categoryName : categoryName,
      categoryCode: editItem?.categoryId,
    });
    getCategroyCodeList(editItem?.categoryName || categoryName);
  }, [editItem, categoryName]);

  return (
    <CustomDialog
      title={
        type === "view" && editItem
          ? "View PBJ Job"
          : editItem
          ? "Edit PBJ Job"
          : "Add PBJ Job"
      }
      open={open}
      onClose={() => {
        onClose();
        setOpen(false);
        reset();
      }}
    >
      <FormLabel label="Job Name" required>
        <FormItem
          name="name"
          control={control}
          errors={errors.name}
          rules={{
            required: "This field is required.",
            validate: validateJobName,
          }}
          render={({ field: { value, onChange } }) => (
            <CustomInput
              placeholder="Job Name"
              value={value}
              onChange={(e) => {
                onChange(e);
                handleJobName();
              }}
            />
          )}
        ></FormItem>
      </FormLabel>

      <FormLabel label="Job Code" required>
        <FormItem
          name="code"
          control={control}
          errors={errors.code}
          rules={{
            required: "This field is required.",
            validate: validateJobCode,
          }}
          render={({ field: { value, onChange } }) => (
            <CustomInput
              placeholder="Job Code"
              value={value}
              onChange={(e) => {
                onChange(e);
                handleJobCode();
              }}
            />
          )}
        />
      </FormLabel>

      <FormLabel label="Category Name" required>
        <FormItem
          name="categoryName"
          control={control}
          errors={errors.categoryName}
          rules={{ required: "This field is required." }}
          render={({ field: { value, onChange } }) => (
            <Select
              isClearable
              options={categoryTransitionList || []}
              value={value}
              onChange={(value) => {
                onChange(value);
                if (value) {
                  getCategroyCodeList(value || "");
                } else {
                  setcategoryCodeDataList([]);
                }
              }}
            />
          )}
        ></FormItem>
      </FormLabel>

      <FormLabel label="Category Code" required>
        <FormItem
          name="categoryCode"
          control={control}
          errors={errors.categoryCode}
          rules={{ required: "This field is required." }}
          render={({ field: { value, onChange } }) => (
            <Select
              isClearable
              options={categoryCodeDataList}
              value={value}
              onChange={(value) => {
                onChange(value);
              }}
            />
          )}
        ></FormItem>
      </FormLabel>

      <div className="flex gap-6 justify-end mt-10">
        <Button
          onClick={() => {
            setOpen(false);
            onClose();
            reset();
          }}
          variant="outline"
        >
          Cancel
        </Button>

        <Button loading={loading} onClick={handleSubmit(submit)}>
          Save
        </Button>
      </div>
      {/* </CustomForm> */}
    </CustomDialog>
  );
};
export default CreateDia;
