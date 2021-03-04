import React, { useState } from 'react';

import Item, { ItemProps } from '../item';

export interface ListProps {
  items: Omit<ItemProps, 'muted' | 'onMouseEnter' | 'onMouseLeave'>[];
}

export const List: React.FC<ListProps> = ({ items }: ListProps) => {
  const [activeItem, setActiveItem] = useState<ItemProps['name']>(null);

  return (
    <>
      {items.map((item, index) => (
        <Item
          {...item}
          key={item.name}
          className={index !== items.length - 1 ? 'mb-1' : undefined}
          muted={activeItem !== null && activeItem !== item.name}
          onMouseEnter={() => setActiveItem(item.name)}
          onMouseLeave={() => setActiveItem(null)}
        />
      ))}
    </>
  );
};

export default List;
