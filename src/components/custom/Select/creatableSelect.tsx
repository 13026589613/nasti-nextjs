import React, { ReactNode, useEffect, useState } from "react";
import { Props } from "react-select";
import CreatableSelect from "react-select/creatable";

import { cn } from "@/lib/utils";

export type OptionType = {
  value: string;
  label: string;
};

interface CustomSelectProps extends Props {
  options: OptionType[];
  dropdownRender?: ReactNode;
  onChange?: (value: any) => void;
  menuWrapperClass?: string;
  closeMenuOnSelect?: boolean;
}
const CustomCreatableSelect = React.forwardRef<
  HTMLInputElement,
  CustomSelectProps
>((props, ref) => {
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
    ...rest
  } = props;

  const [isCloseMenu, setIsCloseMenu] = React.useState(true);
  const [optionsList, setOptionsList] = useState(options);
  const [_isNew, setIsNew] = useState(false);

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

  return (
    <>
      <CreatableSelect
        ref={selectRef}
        closeMenuOnSelect={isCloseMenu}
        isMulti={isMulti}
        placeholder={placeholder}
        isSearchable={isSearchable}
        autoFocus={autoFocus}
        value={value}
        onChange={(newValue: any) => {
          if (!isMulti) {
            // single select
            if (newValue && newValue !== null && newValue.label !== "") {
              const index: number = optionsList.findIndex(
                (option) => option.label === newValue.label
              );

              // if index is -1, it means the new value is not in the options list, so we need to add it
              newValue.index = index;

              if (index === -1) {
                newValue.__isNew__ = true;
                options.push(newValue);
                setOptionsList(options);
                setIsNew(true);
              } else {
                newValue.__isNew__ = false;
                setIsNew(false);
              }

              if (
                newValue.value == "" ||
                newValue.value == null ||
                newValue.value === newValue.label
              ) {
                newValue.__isNew__ = true;
                setIsNew(true);
              } else {
                newValue.__isNew__ = false;
                setIsNew(false);
              }

              onChange?.(newValue);
            } else {
              onChange?.(null);
            }
          } else {
            // multi select
            if (newValue && newValue.length > 0) {
              const index: number = optionsList.findIndex(
                (option) => option.label === newValue[newValue.length - 1].label
              );

              // if index is -1, it means the new value is not in the options list, so we need to add it
              newValue[newValue.length - 1].index = index;

              if (index === -1) {
                newValue[newValue.length - 1].__isNew__ = true;
                options.push(newValue[newValue.length - 1]);
                setOptionsList(options);
                setIsNew(true);
              } else {
                newValue[newValue.length - 1].__isNew__ = false;
                setIsNew(false);
              }

              for (let index = 0; index < newValue.length; index++) {
                const element = newValue[index];

                if (
                  element.value == "" ||
                  element.value == null ||
                  element.value === element.label
                ) {
                  element.__isNew__ = true;
                  setIsNew(true);
                } else {
                  element.__isNew__ = false;
                  setIsNew(false);
                }
              }

              onChange?.(newValue);
            } else {
              onChange?.(null);
            }
          }
          selectRef.current.blur();
        }}
        options={optionsList}
        components={{
          IndicatorSeparator: () => null,
          Menu: ({ innerRef, innerProps, children, isLoading }) => {
            return (
              <div
                ref={innerRef}
                {...innerProps}
                className={cn(
                  "bg-background rounded-[8px] overflow-hidden absolute w-full mt-[10px]  z-[999]",
                  menuWrapperClass
                )}
                style={{
                  boxShadow: "0px 8px 14px 0px #D8DDE680",
                }}
              >
                {children}

                {dropdownRender}
              </div>
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
    </>
  );
});
CustomCreatableSelect.displayName = "CustomCreatableSelect";
export default CustomCreatableSelect;
