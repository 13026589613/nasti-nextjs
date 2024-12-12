import "react-phone-input-2/lib/style.css";

import { forwardRef, useImperativeHandle } from "react";
import PhoneInput from "react-phone-input-2";

interface CustomPhoneInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
const CustomPhoneInput = forwardRef(
  (props: CustomPhoneInputProps, ref: any) => {
    const { value, disabled, placeholder = "(***) ***-****", onChange } = props;

    useImperativeHandle(ref, () => ({
      focus: () => {},
      clear: () => {},
    }));

    return (
      <PhoneInput
        containerClass="phone-input"
        inputClass="phone-input"
        buttonClass="h-10"
        containerStyle={{
          width: "100%",
        }}
        buttonStyle={{
          display: "none",
        }}
        inputStyle={{
          height: "40px",
          width: "100%",
          padding: "0 8px",
          border: "1px solid #E7EDF1",
          borderRadius: "5px",
          color: disabled ? "#97a1b0" : "#1E304B",
        }}
        country="us"
        countryCodeEditable={false}
        disableDropdown={true}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        disableCountryGuess={true}
        onChange={(value) => {
          onChange(value ? value + "" : "");
        }}
      />
    );
  }
);
export default CustomPhoneInput;

CustomPhoneInput.displayName = "CustomPhoneInput";
