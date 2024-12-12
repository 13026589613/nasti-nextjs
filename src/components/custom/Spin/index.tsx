import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface SpinProps {
  className?: string;
  loading?: boolean;
  loaderClassName?: string;
  children?: React.ReactNode;
}

const Spin = (props: SpinProps) => {
  const { className, loading, loaderClassName, children } = props;

  return (
    <div
      className={cn(
        "z-[8] relative",
        loading ? "bg-white opacity-[0.5]" : "",
        className
      )}
    >
      {loading && (
        <Loader2
          className={cn(
            "animate-spin z-[34] absolute left-[calc(50%-12px)]  top-[calc(50%-12px)]",
            loaderClassName
          )}
        />
      )}

      {children}
    </div>
  );
};
export default Spin;
