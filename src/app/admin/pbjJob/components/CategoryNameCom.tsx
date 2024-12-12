import { forwardRef, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";

import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";
import Delete from "~/icons/DeleteIcon.svg";
type RowList = {
  id?: string;
  shiftId?: string;
  name: number | string;
  code: string;
  communityId?: string;
};

type Props = {
  rowList?: RowList[];
};

const CategoryNameCom = ({ rowList }: Props, ref: any) => {
  const [deleteList, setDeleteList] = useState<RowList[]>([]);

  const { control, getValues, setValue } = useForm({
    defaultValues: {
      rowList: rowList?.length
        ? rowList.map((item) => ({
            ...item,
          }))
        : [
            {
              code: "",
              name: "",
            },
          ],
    },
  });

  const addRow = () => {
    const list = getValues("rowList");

    list.push({
      code: "",
      name: "",
    });
    setValue("rowList", list);
  };

  useImperativeHandle(ref, () => ({
    getRowList: () => getValues(),
  }));

  return (
    <>
      <FormField
        control={control}
        name="rowList"
        render={({ field: { value, onChange } }) => {
          return (
            <div ref={ref}>
              {value?.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center w-full mb-3"
                  >
                    <div
                      className={
                        getValues("rowList").length > 1
                          ? "w-[calc(100%-32px)]"
                          : "w-[calc(100%)]"
                      }
                    >
                      <Input
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
                        }}
                      />
                    </div>
                    {getValues("rowList").length > 1 && (
                      <Delete
                        className="cursor-pointer"
                        width={16}
                        color={"#13227A"}
                        onClick={() => {
                          const newValue = value.filter(
                            (_, i: number) => i !== index
                          );
                          onChange(newValue);

                          if (item.id) {
                            const newDeleteList = [...deleteList];

                            newDeleteList.push({
                              ...item,
                              name: Number(item.name),
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
          );
        }}
      ></FormField>

      <div className="text-[#EB1DB2] mt-1" onClick={addRow}>
        + Add Row
      </div>
    </>
  );
};

export default forwardRef(CategoryNameCom);
