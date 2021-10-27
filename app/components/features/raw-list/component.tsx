import React from 'react';

import cx from 'classnames';

import Item from 'components/features/raw-item';
import { ItemProps } from 'components/features/raw-item/component';

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
      'bg-white divide-y divide-black divide-dashed divide-opacity-20': true,
      [className]: !!className,
    })}
  >
    {items.map((item) => {
      return (
        <div key={`${item.id}`}>
          <Item {...item} />
        </div>
      );
    })}
  </div>
);

export default List;
