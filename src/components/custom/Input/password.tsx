import React, { useState } from "react";

import CustomInput, { InputProps } from ".";

interface PasswordInputProps extends InputProps {}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [type, setType] = useState<boolean>(false);
    return (
      <>
        <CustomInput
          ref={ref}
          {...props}
          type={type ? "text" : "password"}
          onClick={() => {
            setType(!type);
          }}
          suffixClassName="cursor-pointer"
          suffix={type ? "OpenEyeIcon" : "CloseEyeIcon"}
        />
      </>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
