import React from 'react';
import cx from 'classnames';

import Item from 'components/projects/item';
import { ItemProps } from 'components/projects/item/component';

export interface ListProps {
  className: string;
  items: ItemProps[];
}

export const List: React.FC<ListProps> = ({
  className,
  items = [],
}: ListProps) => (
  <div
    className={cx({
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4': true,
      [className]: !!className,
    })}
  >
    {items.map((item) => {
      return <Item key={`${item.id}`} {...item} />;
    })}
  </div>
);

export default List;
