import { cn } from "@/lib/utils";

const NumberCircle = ({
  number,
  className,
}: {
  number: number | string | null;
  className?: string;
}) => {
  if (!number) {
    return null;
  }

  let num = parseInt(number.toString());

  if (num > 99) {
    num = 99;
  }
  return (
    <div
      className={cn(
        "px-[6px] min-w-[18px] h-[18px] rounded-[9px] bg-[#EB1DB2] text-[#fff] text-[12px] leading-[18px] text-center",
        className
      )}
    >
      <span>{num == 99 ? "99+" : num}</span>
    </div>
  );
};

export default NumberCircle;
