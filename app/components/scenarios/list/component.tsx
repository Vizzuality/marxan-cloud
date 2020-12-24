import React from 'react';
import cx from 'classnames';

import Item from 'components/scenarios/item';
import { ItemProps } from 'components/scenarios/item/component';

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
      'grid grid-rows-3 gap-3': true,
      [className]: !!className,
    })}
  >
    {items.map((item) => {
      return <Item key={`${item.id}`} {...item} />;
    })}
  </div>
);

export default List;
