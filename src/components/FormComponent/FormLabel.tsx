import { cn } from "@/lib/utils";

type FormLabelProps = {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  extraRender?: React.ReactNode;
};

const FormLabel = (props: FormLabelProps) => {
  const {
    required,
    label,
    children,
    className,
    contentClassName,
    extraRender,
  } = props;
  return (
    <div className={cn("flex flex-col justify-end", className)}>
      {label && (
        <div className="flex items-center mb-[5px] text-[16px] h-10">
          <div className="flex">
            <div>{label}</div>
            {required && <div className="text-[#d838ae] ml-[5px]">*</div>}
          </div>
          {extraRender}
        </div>
      )}
      <div className={cn("min-h-[40px]", contentClassName)}>{children}</div>
    </div>
  );
};

export default FormLabel;
