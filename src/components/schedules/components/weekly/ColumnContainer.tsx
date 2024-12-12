import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo } from "react";

import { cn } from "@/lib/utils";

interface ColumnContainerProps {
  children: React.ReactNode;
  id: string;
  other?: object;
  classname?: string;
}

const ColumnContainer = (props: ColumnContainerProps) => {
  // other：can be used to carry fields that are needed when shift moves to the container
  const { children, id, other = {}, classname } = props;

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
      {...attributes}
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={cn(
        "w-full h-full p-[0px_12px] overflow-hidden",
        classname,
        isDragging && "opacity-50"
      )}
    >
      {children}
    </div>
  );
};

export default memo(ColumnContainer);
