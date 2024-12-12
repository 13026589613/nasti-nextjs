import { useMemo } from "react";
import React from "react";

import { cn } from "@/lib/utils";
import StartIcon from "~/icons/StartIcon.svg";

type ValueType = 0 | 1 | 2 | 3 | 4 | 5 | undefined | null;

interface EvaluateProps {
  value: ValueType;
  disabled?: boolean;
  onChange?: (value: 0 | 1 | 2 | 3 | 4 | 5 | undefined | null) => void;
}

const Evaluate = React.forwardRef<HTMLInputElement, EvaluateProps>(
  (props, ref) => {
    const { value, disabled = false, onChange } = props;

    const current = useMemo(() => {
      if (value === null || value === undefined) {
        return 0;
      }
      return value;
    }, [value]);

    return (
      <div className="flex gap-5">
        {[1, 2, 3, 4, 5].map((item: any) => {
          return (
            <div
              key={item}
              className={cn(
                `w-6 h-6 flex items-center justify-center cursor-pointer `,
                current >= item ? "text-primary" : "text-[#00000040]"
              )}
              onClick={() => {
                if (disabled) {
                  return;
                }
                if (current === item) {
                  onChange?.(0);
                  return;
                }
                onChange?.(item);
              }}
            >
              <StartIcon />
            </div>
          );
        })}
      </div>
    );
  }
);

Evaluate.displayName = "Evaluate";

export default Evaluate;
