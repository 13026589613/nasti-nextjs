import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus } from "lucide-react";
import React, { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select, { Props } from "react-select";
import { toast } from "react-toastify";
import { z } from "zod";

import { FormItem, FormLabel } from "@/components/FormComponent";

import CustomButton from "../Button";
import Dialog from "../Dialog";
import Input from "../Input";
import { SelectMenu } from "../Select";
export type OptionType = {
  value: string;
  label: string;
  __isNew__?: boolean;
};

interface CustomSelectProps extends Props {
  options: OptionType[];
  dropdownRender?: ReactNode;
  menuWrapperClass?: string;
  closeMenuOnSelect?: boolean;
  circlePlusColor?: string;
  label?: string;
  isAdd?: boolean;
  setOptions?: (options: OptionType[]) => void;
  onChange?: (value: any) => void;
}

const FormSchema = z.object({
  name: z.string().min(1, {
    message: "This field is required.",
  }),
});

type FormDataType = z.infer<typeof FormSchema>;

const AddSelect = React.forwardRef<HTMLInputElement, CustomSelectProps>(
  (props, ref) => {
    const {
      isMulti,
      options,
      dropdownRender,
      onChange,
      menuWrapperClass,
      value,
      isSearchable = false,
      autoFocus = false,
      placeholder,
      closeMenuOnSelect,
      circlePlusColor = "#324664",
      setOptions,
      label = "New Option",
      isAdd = true,
      ...rest
    } = props;

    const [isCloseMenu, setIsCloseMenu] = React.useState(true);
    const [optionsList, setOptionsList] = useState(options);

    useEffect(() => {
      setOptionsList(options);
    }, [options]);
    useEffect(() => {
      if (closeMenuOnSelect != undefined) {
        setIsCloseMenu(closeMenuOnSelect);
      } else {
        if (isMulti) {
          setIsCloseMenu(false);
        } else {
          setIsCloseMenu(true);
        }
      }
    }, [closeMenuOnSelect]);

    const selectRef = React.useRef<any>(null);

    const [addDiaShow, setAddDiaShow] = useState(false);

    const form = useForm({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        name: "",
      },
    });

    const { control, handleSubmit } = form;

    const { errors } = form.formState;

    const onSubmit = (formData: FormDataType) => {
      const isExist = optionsList.find((item) => item.label === formData.name);
      if (isExist) {
        toast.warning("This option already exists.");

        return;
      }

      setOptions &&
        setOptions([
          {
            value: formData.name,
            label: formData.name,
            __isNew__: true,
          },
          ...options,
        ]);

      if (isMulti) {
        if (value) {
          onChange &&
            onChange([
              ...(value as OptionType[]),
              {
                value: formData.name,
                label: formData.name,
                __isNew__: true,
              },
            ]);
        } else {
          onChange &&
            onChange([
              {
                value: formData.name,
                label: formData.name,
                __isNew__: true,
              },
            ]);
        }
      } else {
        onChange &&
          onChange({
            value: formData.name,
            label: formData.name,
            __isNew__: true,
          });
      }
      setAddDiaShow(false);
    };

    useEffect(() => {
      if (!addDiaShow) {
        form.reset();
      }
    }, [addDiaShow]);

    return (
      <div className="flex items-start justify-between w-full">
        <div className="w-[calc(100%-32px)]">
          <Select
            ref={selectRef}
            closeMenuOnSelect={isCloseMenu}
            isMulti={isMulti}
            placeholder={placeholder}
            isSearchable={isSearchable}
            autoFocus={autoFocus}
            value={value}
            onChange={(newValue: any) => {
              onChange && onChange(newValue);
              selectRef.current.blur();
            }}
            options={optionsList}
            components={{
              IndicatorSeparator: () => null,
              Menu: (menu: any) => {
                return (
                  <SelectMenu
                    innerRef={menu.innerRef}
                    innerProps={menu.innerProps}
                    isLoading={menu.isLoading}
                    placement={menu.placement}
                    menuWrapperClass={menuWrapperClass}
                    refs={selectRef}
                  >
                    {menu.children}
                  </SelectMenu>
                );
              },
              Placeholder: (props) => {
                const { children } = props;

                return (
                  <div className="absolute z-[10] left-[10px] text-[rgba(0,0,0,0.25)] font-[390] text-[16px]">
                    {children}
                  </div>
                );
              },
            }}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: "#e51a9f",
              },
            })}
            styles={{
              control: (provided, state) => {
                return {
                  ...provided,
                  borderColor: state.isFocused ? "" : "#E7EDF1",
                };
              },
            }}
            {...rest}
          />
        </div>
        {isAdd && (
          <CirclePlus
            color={circlePlusColor}
            onClick={() => {
              if (props.isDisabled) {
                return;
              }
              setAddDiaShow(true);
            }}
            className="mt-2 cursor-pointer"
          ></CirclePlus>
        )}
        <Dialog
          open={addDiaShow}
          width="517px"
          title={"Add Option"}
          onClose={() => setAddDiaShow(false)}
          footer={
            <div>
              <CustomButton
                onClick={() => setAddDiaShow(false)}
                variant={"outline"}
                className="w-[110px]"
              >
                Cancel
              </CustomButton>
              <CustomButton
                className="w-[110px] ml-[22px]"
                onClick={handleSubmit(onSubmit)}
              >
                Save
              </CustomButton>
            </div>
          }
        >
          <FormLabel label={label} required>
            <FormItem
              name="name"
              control={control}
              errors={errors.name}
              render={({ field }) => <Input placeholder={label} {...field} />}
              rules={{ required: "This field is required." }}
            />
          </FormLabel>
        </Dialog>
      </div>
    );
  }
);
AddSelect.displayName = "AddSelect";
export default AddSelect;
