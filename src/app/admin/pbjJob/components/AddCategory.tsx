import { useDebounceFn } from "ahooks";
import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createPbjCategoty, editPbjCategoty } from "@/api/admin/pbjJob/index";
import { EditPbjCategotyParams } from "@/api/admin/pbjJob/type";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomInput from "@/components/custom/Input";
import { FormItem, FormLabel } from "@/components/FormComponent";
import { MESSAGE } from "@/constant/message";
import Delete from "~/icons/DeleteIcon.svg";

interface CreateDiaProps {
  type?: string;
  open: boolean;
  editItem: any;
  categoryList?: string[];
  setOpen: (value: boolean) => void;
  onClose?: () => void;
  getList?: (type: string) => void;
}

export type RowList = {
  id?: string;
  code?: string;
  name?: string;
};

const AddCategory = (props: CreateDiaProps) => {
  const { open, setOpen, getList, editItem, categoryList } = props;

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    getValues,
    clearErrors,
    setError,
  } = useForm<any>({
    defaultValues: {
      name: "",
      categoryList: [{ code: "", name: "" }],
    },
  });

  const [loading, setLoading] = useState(false);

  const [disabled, setDisabled] = useState(false);

  const [deleteList, setDeleteList] = useState<RowList[]>([]);

  const categoryNameRun = useDebounceFn(
    (val: string) => {
      const lowerCaseInput = val.toLowerCase();
      const lowerCaseCategories = categoryList?.map((category) =>
        category.toLowerCase()
      );

      if (lowerCaseCategories?.includes(lowerCaseInput)) {
        setError("name", {
          message: "This category name already exists.",
        });
        setDisabled(true);
      } else {
        clearErrors("name");
        setDisabled(false);
      }
    },
    {
      wait: 500,
    }
  );
  const categoryListRun = useDebounceFn(
    (v: string) => {
      let codeList = editItem.rowList.map((item: any) => item.code);
      if (codeList?.includes(v)) {
        setError("categoryList", {
          message: "A category cannot be assigned duplicate codes.",
        });
        setDisabled(true);
      } else {
        clearErrors("categoryList");
        setDisabled(false);
      }
    },
    {
      wait: 500,
    }
  );

  const submit = async (param: any) => {
    setDisabled(false);
    if (editItem) {
      edit(param);
    } else {
      create(param);
    }
  };

  const addRow = () => {
    const list = getValues("categoryList");

    list.push({
      code: "",
      name: "",
    });
    setValue("categoryList", list);
  };

  const edit = async (data: any) => {
    setLoading(true);
    let list = data.categoryList;

    let rowListCopy = cloneDeep(editItem.rowList);
    rowListCopy.forEach((item: any) => {
      item.name = data.name;
    });
    const existingCodes = new Set(rowListCopy.map((item: any) => item.code));
    list.forEach((item: any) => {
      if (!existingCodes.has(item.code)) {
        const newItem = { ...item, name: getValues("name") };
        rowListCopy.push(newItem);
      }
    });
    let ids: string[] = [];
    ids = deleteList?.map((item: any) => item.id);
    let params: EditPbjCategotyParams = {
      deleteList: ids,
      categoryList:
        rowListCopy.filter((item: any) => !ids.includes(item.id)) || [],
    };

    try {
      const { code, data } = await editPbjCategoty(params);
      if (code === 200 && data) {
        setOpen(false);
        getList?.("edit");
        reset();
        toast.success(MESSAGE.edit, {
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const create = async (param: any) => {
    setLoading(true);
    let list = param.categoryList;
    list.forEach((item: any) => {
      item.name = getValues("name");
    });
    try {
      const { code, data } = await createPbjCategoty(list);
      if (code === 200 && data) {
        setOpen(false);
        getList?.("create");
        reset();
        toast.success(MESSAGE.create, {
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!getValues("categoryList").at(-1)?.code) {
      return "This field is required.";
    }
    return true;
  };

  useEffect(() => {
    if (editItem) {
      setValue("name", editItem.name);
      setValue("categoryList", editItem.rowList);
    }
  }, [editItem]);

  return (
    <CustomDialog
      open={open}
      title={editItem ? "Edit Category" : "Add Category"}
      onClose={() => {
        setOpen(false);
        setDeleteList([]);
        reset();
        setDisabled(false);
      }}
    >
      <FormLabel label="Category Name" required>
        <FormItem
          name="name"
          control={control}
          errors={errors.name}
          rules={{
            required: "This field is required.",
          }}
          render={({ field: { value, onChange } }) => (
            <CustomInput
              placeholder="Category Name"
              value={value}
              onChange={(v) => {
                onChange(v);
                categoryNameRun.run(v.target.value);
              }}
            />
          )}
        />
      </FormLabel>
      <FormLabel label="Category Code" required>
        <FormItem
          name="categoryList"
          control={control}
          errors={errors.categoryList}
          rules={{ required: "This field is required.", validate }}
          render={({ field: { value, onChange } }) => (
            <div>
              {value?.map((item: any, index: number) => {
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center w-full mb-3"
                  >
                    <div
                      className={
                        getValues("categoryList")?.length > 1
                          ? "w-[calc(100%-32px)]"
                          : "w-[calc(100%)]"
                      }
                    >
                      <CustomInput
                        placeholder="Category Code"
                        value={item.code}
                        onChange={(e) => {
                          const newValue = value.map((item: any, i: number) => {
                            if (i === index) {
                              return {
                                ...item,
                                code: e.target.value,
                              };
                            }
                            return item;
                          });
                          onChange(newValue);
                          categoryListRun.run(e.target.value);
                        }}
                      />
                    </div>
                    {getValues("categoryList")?.length > 1 && (
                      <Delete
                        className="cursor-pointer"
                        width={16}
                        color={"#13227A"}
                        onClick={() => {
                          setDisabled(false);
                          clearErrors("categoryList");
                          const newValue = value.filter(
                            (_: any, i: number) => i !== index
                          );
                          onChange(newValue);
                          if (item.id) {
                            const newDeleteList = [...deleteList];
                            newDeleteList.push({
                              ...item,
                              name: item.name,
                            });
                            setDeleteList(newDeleteList);
                          }
                        }}
                      ></Delete>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        />
      </FormLabel>
      <div
        className="text-[#EB1DB2] mt-1 w-[80px] cursor-pointer"
        onClick={addRow}
      >
        + Add Row
      </div>
      <div className="flex gap-6 justify-end mt-10">
        <Button
          onClick={() => {
            setOpen(false);
            reset();
            setDisabled(false);
          }}
          variant="outline"
        >
          Cancel
        </Button>

        <Button
          loading={loading}
          disabled={disabled}
          onClick={handleSubmit(submit)}
        >
          Save
        </Button>
      </div>
    </CustomDialog>
  );
};
export default AddCategory;
