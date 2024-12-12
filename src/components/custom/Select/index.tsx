import useResizeObserver from "@react-hook/resize-observer";
import React, {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Select, {
  ActionMeta,
  CoercedMenuPlacement,
  components,
  Props,
} from "react-select";

import { cn } from "@/lib/utils";

export type OptionType = {
  value: string | number;
  label: string;
  isDisabled?: boolean;
  isFixed?: boolean;
  __isNew__?: boolean;
};

interface DropdownRenderProps {
  closeMenu: () => void;
}
interface CustomSelectProps extends Props {
  options: OptionType[];
  dropdownRender?: (props: DropdownRenderProps) => ReactNode;
  onChange?: (value: any) => void;
  menuWrapperClass?: string;
  isDisabled?: boolean;
  style?: React.CSSProperties;
  closeMenuOnSelect?: boolean;
  isWrap?: boolean;
  isClearable?: boolean;
  customMenu?: React.FunctionComponent;
  isSearchable?: boolean;
}

const CustomSelect = React.forwardRef<HTMLInputElement, CustomSelectProps>(
  (props, ref) => {
    const {
      options,
      dropdownRender,
      onChange,
      menuWrapperClass,
      value,
      isMulti,
      isDisabled,
      style,
      closeMenuOnSelect,
      isWrap,
      isClearable,
      customMenu,
      isSearchable = true,
      ...rest
    } = props;
    let selectOption: OptionType | OptionType[] | undefined = undefined;
    const [isCloseMenu, setIsCloseMenu] = React.useState(true);
    if (isMulti) {
      if (value) {
        selectOption = options.filter((option) =>
          (value as Array<string | number>).includes(option.value)
        );
      }
    } else {
      selectOption = options.find((option) => option.value === value);
    }
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

    const refs = useRef<any>(null);

    const iscClearables = useMemo(() => {
      if (selectOption && isMulti) {
        return (selectOption as OptionType[]).some((item) => !item.isFixed);
      } else {
        return isClearable;
      }
    }, [selectOption, isClearable, isMulti]);

    const getComponents = useCallback(() => {
      const obj = {
        IndicatorSeparator: () => null,
        Menu: (menu: any) => {
          return (
            <SelectMenu
              innerRef={menu.innerRef}
              innerProps={menu.innerProps}
              isLoading={menu.isLoading}
              placement={menu.placement}
              dropdownRender={dropdownRender}
              menuWrapperClass={menuWrapperClass}
              refs={refs}
            >
              {menu.children}
            </SelectMenu>
          );
        },

        MultiValue: (props: any) => {
          props.components.Label = Label;
          return <components.MultiValue title="123" {...props} />;
        },

        Placeholder: (props: any) => {
          const { children } = props;
          return (
            <div className="absolute left-[10px] text-[rgba(0,0,0,0.25)] font-[390] text-[16px]">
              {children}
            </div>
          );
        },
      };
      return customMenu ? Object.assign({}, obj, { Option: customMenu }) : obj;
    }, [customMenu]);

    useImperativeHandle(ref, () => refs.current);

    return (
      <Select
        ref={refs}
        isDisabled={isDisabled}
        isMulti={isMulti}
        isSearchable={isSearchable}
        closeMenuOnSelect={isCloseMenu}
        value={selectOption ? selectOption : null}
        onChange={(newValue: any, actionMeta: ActionMeta<any>) => {
          if (actionMeta.action === "clear" && selectOption && isMulti) {
            newValue = (selectOption as OptionType[]).filter(
              (item: any) => item.isFixed
            );
          }

          if (newValue) {
            if (isMulti) {
              let value = newValue.map((item: any) => item.value);
              onChange && onChange(value);
            } else {
              onChange && onChange(newValue.value);
            }
          } else {
            onChange && onChange(null);
          }
        }}
        options={options}
        components={getComponents()}
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
              minHeight: 40,
              width: "100%",
              ...style,
            };
          },
          valueContainer: (provided) => {
            return {
              ...provided,
              flexWrap: isWrap ? "wrap" : "nowrap",
              display: "flex",
              alignItems: "center",
            };
          },
          multiValue: (base, state: any) => {
            let isFixed = state.data.isFixed
              ? { ...base, backgroundColor: "gray" }
              : base;
            return {
              ...isFixed,
              minWidth: "24px",
              maxWidth: "100%",
            };
          },
          multiValueLabel: (base, state: any) => {
            return state.data.isFixed
              ? { ...base, fontWeight: "bold", color: "white", paddingRight: 6 }
              : base;
          },
          multiValueRemove: (base, state: any) => {
            return state.data.isFixed ? { ...base, display: "none" } : base;
          },
        }}
        menuShouldScrollIntoView={true}
        isClearable={iscClearables}
        filterOption={(option: any, rawInput: string) => {
          const words = rawInput.split(" ");
          return words.every((word) =>
            option.label.toLowerCase().includes(word.toLowerCase())
          );
        }}
        {...rest}
      />
    );
  }
);
CustomSelect.displayName = "CustomSelect";
export default CustomSelect;

export const SelectMenu = memo(
  (props: {
    innerRef: any;
    innerProps: JSX.IntrinsicElements["div"];
    isLoading: boolean;
    placement: CoercedMenuPlacement;
    children: ReactNode;
    menuWrapperClass?: string;
    refs: React.MutableRefObject<any>;
    dropdownRender?: (props: DropdownRenderProps) => ReactNode;
  }) => {
    const {
      innerRef,
      innerProps,
      children,
      dropdownRender,
      menuWrapperClass,
      placement,
      refs,
    } = props;

    const [containerHeight, setContainerHeight] = useState<DOMRectReadOnly>();

    useLayoutEffect(() => {
      if (refs.current) {
        setContainerHeight(refs.current.controlRef.getBoundingClientRect());
      }
    }, [refs]);

    useResizeObserver(refs.current?.controlRef, (entry) =>
      setContainerHeight(entry.contentRect)
    );

    const [height, setHeight] = useState(0);

    useEffect(() => {
      if (innerRef?.current) {
        setHeight(innerRef.current.clientHeight);
      }
    }, [innerRef?.current, children]);

    const top = useMemo(() => {
      return height && placement === "top" ? `-${height + 10}px` : "0";
    }, [height, placement]);

    const marginTop = useMemo(() => {
      if (placement === "top") {
        return "0";
      } else {
        return containerHeight?.height ? containerHeight?.height + 4 : 40;
      }
    }, [containerHeight]);

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className={cn(
          "bg-background rounded-[8px] absolute w-full z-[999]",
          placement === "top" ? "mt-0" : "mt-10",
          menuWrapperClass
        )}
        style={{
          boxShadow: "0px 8px 14px 0px #D8DDE680",
          top: top,
          marginTop: marginTop,
        }}
      >
        {children}

        {dropdownRender &&
          dropdownRender({
            closeMenu: () => {
              if (refs.current) {
                refs.current.blur();
              }
            },
          })}
      </div>
    );
  }
);

SelectMenu.displayName = "SelectMenu";

export const Label = (props: any) => {
  const { children, innerProps } = props;
  return (
    <div
      title={children}
      className={cn(
        "overflow-hidden text-ellipsis text-nowrap rounded-[2px] text-[hsl(0, 0%, 20%)] text-[85%] p-[3px]",
        innerProps.className
      )}
      style={innerProps.css}
    >
      {children}
    </div>
  );
};
