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
        "absolute scale-50 top-[-16px] right-[-32px] px-[6px] min-w-[36px] h-[36px] rounded-[18px] bg-[#EB1DB2] text-[#fff] text-[24px] leading-[36px] text-center",
        num >= 10 && "right-[-30px]",
        num === 99 && "right-[-40px]",
        className
      )}
    >
      <span>{num == 99 ? "99+" : num}</span>
    </div>
  );
};

export default NumberCircle;
