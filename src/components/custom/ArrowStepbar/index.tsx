import "./style.css";

import { cn } from "@/lib/utils";
type barItem = {
  label: string;
  key: number;
};
interface ArrowStepBarProps {
  data: Array<barItem>;
  children?: React.ReactNode;
  index?: number; // default value: 1
  onClick?: Function;
}

export default function ArrowStepbar({
  data,
  index = 1,
  children,
  onClick,
}: ArrowStepBarProps) {
  const domHtml = data.map((item, one) => {
    return (
      <li
        onClick={() => onClick && onClick(one + 1)}
        key={item.key}
        className={cn(
          "progress",
          index <= one ? "" : "active",
          one === data.length - 1 ? "cssNavEnd" : "",
          onClick && "cursor-pointer"
        )}
        style={{
          width: `calc((100% - ${(data.length - 1) * 10}px) / ${data.length})`,
          // display: `${index <= one ? "none" : ""}`,
        }}
      >
        <span
          className={cn(
            "p-text font-[450] text-[18px]",
            index <= one ? "" : "active"
          )}
        >
          {item.label}
        </span>
      </li>
    );
  });
  return (
    <div className="progress-wraper rounded">
      <ul className="progress-bar space-x-2.5 rounded">{domHtml}</ul>
    </div>
  );
}
