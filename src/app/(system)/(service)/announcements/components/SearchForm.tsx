// import { useEffect } from "react";

// import { notificationsCateTypes } from "@/api/notifications";
// import CustomSelect from "@/components/custom/Select";
import CustomButton from "@/components/custom/Button";
import FormItemLabel from "@/components/custom/FormItemLabel";
import Input from "@/components/custom/Input";
import RangeDatePicker from "@/components/custom/RangeDatePicker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuestionIcon from "~/icons/QuestionIcon.svg";
// import { cateTypeKeys, notificationsCateTypesOptionData } from "../type";
// import { getNeedHelpShiftStatusOptions } from "@/constant/listOption";
export interface SearchParams {
  dateTime: string[] | null;
  content: string;
}
export interface SearchFormProps {
  searchParams: SearchParams;
  isHasAnnouncementAddPermission: boolean;
  setSearchParams: (value: SearchParams) => void;
  setEditDialogOpen: (value: boolean) => void;
}
const TableSearchForm = (props: SearchFormProps) => {
  const {
    searchParams,
    isHasAnnouncementAddPermission,
    setSearchParams,
    setEditDialogOpen,
  } = props;
  // // const [cateOption, setCateOption] =
  // //   useState<notificationsCateTypesOptionData[]>();
  // const getNotificationsCateTypes = async () => {
  //   try {
  //     const { data, code } = await notificationsCateTypes();
  //     if (code !== 200) return;
  //     // setCateOption(
  //     //   data.map((item) => {
  //     //     return {
  //     //       label: item.description,
  //     //       value: item.key,
  //     //     };
  //     //   })
  //     // );
  //     console.log(data);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //   }
  // };
  // useEffect(() => {
  //   getNotificationsCateTypes();
  // }, []);

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between items-end mb-[20px]">
        <div className="flex gap-x-5 flex-wrap w-full">
          <FormItemLabel
            className="w-[24%]"
            labelClassName={"h-10"}
            label={"Content"}
          >
            <Input
              value={searchParams.content}
              className="w-full"
              isClearable
              placeholder="Search by Content"
              onChange={(e) => {
                setSearchParams({
                  ...searchParams,
                  content: e.target.value,
                });
              }}
              suffix="SearchIcon"
            />
          </FormItemLabel>
          <FormItemLabel label="Published Date" className="w-[24%]">
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
        {isHasAnnouncementAddPermission && (
          <div className="flex justify-between">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  onClick={(e: any) => {
                    e.stopPropagation();
                  }}
                >
                  <QuestionIcon color="var(--primary-color)" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="w-[650px]">
                    <p>
                      {`An Announcement is a unidirectional broadcast to your entire community or to one or several departments.`}
                    </p>
                    <p>
                      {`The broadcast will remain at the top of a team member's web or mobile app until you elect to remove it.`}
                    </p>
                    <p>
                      {`If you would rather have a conversation with team members, we recommend sending a message, instead.`}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <CustomButton
              className="ml-5"
              onClick={() => setEditDialogOpen(true)}
              icon="add"
            >
              Add
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableSearchForm;
