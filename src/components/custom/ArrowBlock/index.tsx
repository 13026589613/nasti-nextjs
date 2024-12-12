import LeftArrow from "~/icons/LeftArrow.svg";
import RightArrow from "~/icons/RightArrow.svg";
interface ArrowBlockProps {
  type?: string;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}
export default function ArrowBlock(props: ArrowBlockProps) {
  const { type = "left", color, active, onClick } = props;
  return (
    <div
      className={`flex justify-center items-center w-6 h-6 rounded-[2px] border border-[${
        active ? "#1890FF" : "#D9D9D9"
      }] bg-[${active ? "var(--primary-color)" : "#F5F5F5"}] cursor-pointer`}
      onClick={() => onClick && onClick()}
    >
      {type == "left" ? (
        <LeftArrow
          color={`${active ? "#fff" : color ? color : "#000"}`}
          opacity={`${!active && "0.25"}`}
        />
      ) : (
        <RightArrow
          color={`${active ? "#fff" : color ? color : "rgba(0,0,0,0.25)"}`}
        />
      )}
    </div>
  );
}
