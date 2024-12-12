import { useEffect, useState } from "react";

import { notificationsCateTypes } from "@/api/notifications";
import FormItemLabel from "@/components/custom/FormItemLabel";
import RangeDatePicker from "@/components/custom/RangeDatePicker";
// import CustomSelect from "@/components/custom/Select";
import sortListByKey from "@/utils/sortByKey";

import { cateTypeKeys, notificationsCateTypesOptionData } from "../type";
// import { getNeedHelpShiftStatusOptions } from "@/constant/listOption";
export interface SearchParams {
  dateTime: string[] | null;
  notificationType: cateTypeKeys | null;
}

export interface SearchFormProps {
  searchParams: SearchParams;
  setSearchParams: (value: SearchParams) => void;
}
const TableSearchForm = (props: SearchFormProps) => {
  const { searchParams, setSearchParams } = props;
  const [cateOption, setCateOption] =
    useState<notificationsCateTypesOptionData[]>();
  const getNotificationsCateTypes = async () => {
    try {
      const { data, code } = await notificationsCateTypes();
      if (code !== 200) return;
      setCateOption(
        sortListByKey(
          data.map((item) => {
            return {
              label: item.description,
              value: item.key,
            };
          })
        )
      );
    } finally {
    }
  };
  useEffect(() => {
    getNotificationsCateTypes();
  }, []);
  console.log(cateOption);

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-x-5 flex-wrap w-full">
          {/* <FormItemLabel
            className="w-[24%]"
            labelClassName={"h-10"}
            label={"Category"}
          >
            <CustomSelect
              options={cateOption || []}
              value={searchParams.notificationType}
              onChange={(value) => {
                setSearchParams({
                  ...searchParams,
                  notificationType: value,
                });
              }}
              placeholder="Category"
              isClearable={true}
            ></CustomSelect>
          </FormItemLabel> */}
          <FormItemLabel label="Notification Date Time" className="w-[24%]">
            <RangeDatePicker
              value={searchParams.dateTime}
              onChange={(value) => {
                setSearchParams({
                  ...searchParams,
                  dateTime: value,
                });
              }}
            ></RangeDatePicker>
          </FormItemLabel>
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;
