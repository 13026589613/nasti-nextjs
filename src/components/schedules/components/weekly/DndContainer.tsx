import {
  Collision,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
} from "@dnd-kit/core";
import { memo, useId } from "react";

interface DndContainerProps {
  children: React.ReactNode;
  onDragStart?(event: DragStartEvent): void;
  onDragEnd?(event: DragEndEvent): void;
}

const DndContainer = (props: DndContainerProps) => {
  const { children, onDragStart, onDragEnd } = props;

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const id = useId();

  const customCollisionDetection: CollisionDetection = ({
    collisionRect,
    droppableRects,
    droppableContainers,
  }) => {
    const collisions: Collision[] = [];

    droppableContainers.forEach((container) => {
      const rect = droppableRects.get(container.id);

      if (rect) {
        const leftTopCorner = { x: collisionRect.left, y: collisionRect.top };

        if (
          leftTopCorner.x >= rect.left &&
          leftTopCorner.x <= rect.right &&
          leftTopCorner.y >= rect.top &&
          leftTopCorner.y <= rect.bottom
        ) {
          collisions.push({
            id: container.id,
            data: {
              droppableContainer: container,
              value:
                Math.abs(leftTopCorner.x - rect.left) +
                Math.abs(leftTopCorner.y - rect.top),
            },
          });
        }
      }
    });

    return collisions;
  };

  return (
    <div className="border-b-[1px] border-b-[#E7EDF1]">
      <DndContext
        sensors={[pointerSensor]}
        id={id}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        collisionDetection={customCollisionDetection}
      >
        {children}
      </DndContext>
    </div>
  );
};

export default memo(DndContainer);
