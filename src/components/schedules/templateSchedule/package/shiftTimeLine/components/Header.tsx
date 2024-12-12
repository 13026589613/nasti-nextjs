import { cn } from "@/lib/utils";

interface HeaderProps {
  dayHours: string[];
  contentWidth: number;
}

const Header = (props: HeaderProps) => {
  const { dayHours, contentWidth } = props;

  return (
    <div className="flex items-center justify-end h-[55px] bg-[#f0f4fd] text-[#324664]">
      <div className="flex-1 h-full border-r-[1px] border-r-[#E7EDF1] flex justify-center items-center">
        Time
      </div>
      <div
        className="flex"
        style={{
          width: contentWidth,
        }}
      >
        {dayHours.map((hours, index) => (
          <div
            key={hours}
            style={{
              width: `${contentWidth / dayHours.length}px`,
            }}
            className={cn("text-left", index === 0 && "pl-1")}
          >
            {hours}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Header;
