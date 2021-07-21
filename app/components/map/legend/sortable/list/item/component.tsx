import React, { ReactElement, cloneElement } from 'react';
import cx from 'classnames';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface SortableItemProps {
  id: string;
  sortable: {
    enabled: boolean;
    handle: boolean;
    handleIcon: React.ReactNode,
  };
  children: ReactElement
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  sortable,
  children,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setNodeRef,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const CHILD = cloneElement(children, {
    sortable,
    listeners,
    attributes,
    isDragging,
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...!sortable.handle && {
        ...listeners,
        ...attributes,
      }}
      className={cx({
        'opacity-0': isDragging,
      })}
    >
      {CHILD}
    </div>
  );
};

export default SortableItem;
