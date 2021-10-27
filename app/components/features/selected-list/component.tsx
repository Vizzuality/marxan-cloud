import React from 'react';

import cx from 'classnames';

import Item from 'components/features/selected-item';
import { ItemProps } from 'components/features/selected-item/component';

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
      'bg-gray-800': true,
      [className]: !!className,
    })}
  >
    {items.map((item, i) => {
      return (
        <div
          className={cx({
            'mt-1.5': i !== 0,
          })}
          key={`${item.id}`}
        >
          <Item {...item} />
        </div>
      );
    })}
  </div>
);

export default List;
