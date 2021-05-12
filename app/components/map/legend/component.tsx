import React, {
  Children, cloneElement, isValidElement, useCallback,
} from 'react';
import cx from 'classnames';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import LegendItem from './item';

export interface LegendProps {
  className?: string;
  children: React.ReactNode;
  onChangeOrder: (id: string[]) => void;
}

export const Legend: React.FC<LegendProps> = ({
  children,
  className = '',
  onChangeOrder,
}: LegendProps) => {
  const itemsIds = Children.map(children, (Child) => {
    if (isValidElement(Child)) {
      const { props } = Child;
      const { id } = props;
      return id;
    }

    return null;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = itemsIds.indexOf(active.id);
      const newIndex = itemsIds.indexOf(over.id);

      if (onChangeOrder) onChangeOrder(arrayMove(itemsIds, oldIndex, newIndex));
    }
  }, [itemsIds, onChangeOrder]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={itemsIds}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cx({
            'w-full': true,
            [className]: !!className,
          })}
        >
          {Children
            .map(children, (Child) => {
              if (isValidElement(Child)) {
                const { props: { id } } = Child;
                return (
                  <LegendItem id={id}>
                    {cloneElement(Child)}
                  </LegendItem>
                );
              }
              return null;
            })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default Legend;
