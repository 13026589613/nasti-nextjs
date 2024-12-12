import { useSortable } from "@dnd-kit/sortable";
const EmptyShift = ({
  index,
  date,
  id,
}: {
  index: number;
  date: string;
  id: string;
}) => {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: index + date + id,
    data: {
      type: "emptyShift",
      date: date,
      index: index,
    },
    disabled: true,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="w-full h-[98px] mb-[10px]"
    ></div>
  );
};

export default EmptyShift;
