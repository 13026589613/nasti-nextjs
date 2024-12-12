import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Input from "@/components/custom/Input";

interface ViewCensusProps {
  disabled?: boolean;
  value: number | string;
  isShowLabel?: boolean;
  inputWidth?: string;
  onBlur: (value: number) => void;
}

const ViewCensus = (props: ViewCensusProps) => {
  const {
    value = 0,
    disabled = false,
    isShowLabel = true,
    inputWidth,
    onBlur,
  } = props;
  const [lastValue, setLastValue] = useState(String(value));
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    if (String(value) !== inputValue) {
      setInputValue(String(value));
    }
    if (String(value) !== lastValue) {
      setLastValue(String(value));
    }
  }, [value]);

  return (
    <div className="flex items-center">
      {isShowLabel && <span className="mr-2">Census:</span>}
      <Input
        style={{
          width: inputWidth ? inputWidth : "120px",
        }}
        placeholder="Census"
        disabled={disabled}
        value={inputValue}
        onChange={(event) => {
          const inputValue = event.target.value;
          const filteredValue = inputValue.replace(/[^0-9]/g, "");
          setInputValue(filteredValue);
        }}
        onBlur={() => {
          if (inputValue === "0") {
            setInputValue(lastValue);
            toast.warning("Census must be greater than 0.", {
              position: "top-center",
            });
          } else if (inputValue === "") {
            setLastValue("");
            setInputValue("");
            onBlur(parseInt("0"));
          } else {
            setLastValue(inputValue);
            onBlur(parseInt(inputValue));
          }
        }}
      />
    </div>
  );
};

export default ViewCensus;
