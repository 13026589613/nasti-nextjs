"use client";

import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  getScheduleTemplateInfo,
  scheduleTemplateEdit,
} from "@/api/scheduleTemplates";
import AuthProvide from "@/components/custom/Auth";
import Input from "@/components/custom/Input";
import Tooltip from "@/components/custom/Tooltip";
import { FormItem, FormLabel } from "@/components/FormComponent";
import { MESSAGE } from "@/constant/message";
import { cn } from "@/lib/utils";
import useUserStore from "@/store/useUserStore";
import CoarseClose from "~/icons/CoarseClose.svg";
import EditIcon from "~/icons/EditIcon.svg";
import SaveIcon from "~/icons/SaveIcon.svg";

type ScheduleTemplatesForm = {
  name: string;
};

type ScheduleTemplateInfoProps = {
  templateId: string;
  isEdit: boolean;
};

const ScheduleTemplateInfo = (props: ScheduleTemplateInfoProps) => {
  const { templateId, isEdit } = props;

  const [isEditName, setIsEditName] = useState(false);

  const communityId = useUserStore((state) => state.operateCommunity?.id || "");

  const {
    control,
    formState: { errors, dirtyFields },
    reset,
    getValues,
    handleSubmit,
  } = useForm<ScheduleTemplatesForm>({
    defaultValues: {
      name: "",
    },
  });

  const [lastName, setLastName] = useState("");

  const loadGetScheduleTemplateInfo = () => {
    getScheduleTemplateInfo(templateId).then(({ code, data }) => {
      if (code !== 200) return;

      const { name } = data;

      reset({
        name,
      });
    });
  };

  const onSubmit = (data: ScheduleTemplatesForm) => {
    const { name } = data;

    scheduleTemplateEdit({
      id: templateId,
      communityId,
      name: name,
    }).then(({ code }) => {
      if (code !== 200) return;

      loadGetScheduleTemplateInfo();

      setIsEditName(false);

      toast.success(MESSAGE.edit, {
        position: "top-center",
      });
    });
  };

  useEffect(() => {
    loadGetScheduleTemplateInfo();
  }, []);

  return (
    <div className="flex">
      <div className="w-[774px] flex items-center">
        <FormLabel
          label="Template Name"
          required={isEditName}
          className="w-full"
        >
          <FormItem
            className="flex-1 mr-[20px]"
            name="name"
            border={isEditName}
            control={control}
            errors={errors.name}
            rules={{ required: "Template Name is required" }}
            render={({ field }) => (
              <Input
                placeholder="Template Name"
                {...field}
                disabled={!isEditName}
                className={cn({
                  "border-[transparent]": !isEditName,
                })}
              />
            )}
          />
        </FormLabel>

        {isEdit && (
          <AuthProvide permissionName={"TEMPLATE_MANAGEMENT_EDIT"}>
            <div className="cursor-pointer flex mb-[-10px]">
              {isEditName ? (
                <div className="flex items-center">
                  <Tooltip content="Save">
                    <SaveIcon
                      className="mr-[15px]"
                      onClick={() => {
                        // Check whether the field is modified
                        if (!dirtyFields.name) {
                          setIsEditName(false);
                          return;
                        }

                        handleSubmit(onSubmit)();
                      }}
                    />
                  </Tooltip>

                  <Tooltip content="Cancel">
                    <CoarseClose
                      width="15px"
                      height="15px"
                      color="#EB1DB2"
                      onClick={() => {
                        reset({
                          name: lastName,
                        });

                        setIsEditName(false);
                      }}
                    />
                  </Tooltip>
                </div>
              ) : (
                <Tooltip content="Edit">
                  <EditIcon
                    width="16px"
                    height="16px"
                    color="#EB1DB2"
                    onClick={() => {
                      setLastName(getValues("name"));

                      setIsEditName(true);
                    }}
                  />
                </Tooltip>
              )}
            </div>
          </AuthProvide>
        )}
      </div>
    </div>
  );
};

export default memo(ScheduleTemplateInfo);
