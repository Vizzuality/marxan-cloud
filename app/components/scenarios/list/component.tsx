import React from 'react';

import Item from 'components/scenarios/item';
import { ItemProps } from 'components/scenarios/item/component';

export interface ListProps {
  className: string;
  items: ItemProps[];
}

export const List: React.FC<ListProps> = ({ className, items = [] }: ListProps) => (
  <div className={className}>
    {items.map((item) => {
      return <Item className="mb-3" key={`${item.id}`} {...item} />;
    })}
  </div>
);

export default List;
