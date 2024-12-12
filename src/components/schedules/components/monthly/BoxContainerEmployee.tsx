import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";
interface BoxContainerProps {
  children: React.ReactNode;
  id: string;
  other?: object;
  onMouseLeave?: () => void;
  onMouseEnter?: () => void;
}

const BoxContainerEmployee = (props: BoxContainerProps) => {
  const { children, id, other = {}, onMouseLeave, onMouseEnter } = props;
  const { attributes, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: id,
      data: {
        type: "container",
        ...other,
      },
    });
  return (
    <div
      className={cn(
        "flex-[1_0_14.28%] min-w-[182px] border-[1px] border-[#E7EDF1] relative min-h-[95px]",
        isDragging && "opacity-50"
      )}
      {...attributes}
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </div>
  );
};

export default BoxContainerEmployee;
