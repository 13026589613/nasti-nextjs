import { cn } from "@/lib/utils";

interface Props {
  type: string;
  setType: (type: string) => void;
}
const LoginTabs = (props: Props) => {
  const { type, setType } = props;
  const MAP = [
    {
      name: "NASTi Account",
      value: "nasti",
    },
    {
      name: "KARE Account",
      value: "kare",
    },
  ];
  return (
    <div className="relative w-full h-[70px] border-b-[1px] border-b-[#E7EDF1]">
      <div className="flex items-center w-full h-[40px]">
        {MAP.map((item) => (
          <div
            key={item.value}
            className={cn(
              "flex-1 font-[400] text-[20px] leading-[40px] text-center cursor-pointer",
              type === item.value ? "text-[#EB1DB2]" : "text-[#324664]"
            )}
            onClick={() => {
              setType(item.value);
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
      <div
        className={cn(
          "absolute bottom-0 w-[97px] h-[4px] bg-[#EB1DB2] transition-[left] ease-in-out",
          type === "kare" && "left-[240px]",
          type === "nasti" && "left-[47px]"
        )}
      ></div>
    </div>
  );
};

export default LoginTabs;
