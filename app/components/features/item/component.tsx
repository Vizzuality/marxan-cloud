import React from 'react';
import cx from 'classnames';

import Button from 'components/button';
import Tag from 'components/tag';

export interface ItemProps {
  id: string;
  className?: string;
  name: string;
  description: string;
  tags?: Record<string, unknown>[];
  selected: boolean;
  onToggleSelected: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Item: React.FC<ItemProps> = ({
  className,
  name,
  description,
  tags = [],
  selected,
  onToggleSelected,
}: ItemProps) => {
  return (
    <div
      className={cx({
        'bg-white px-0 py-6 text-black': true,
        [className]: !!className,
      })}
    >
      <header className="flex justify-between flex-1">
        <div>
          <h2 className="text-sm font-medium font-heading">{name}</h2>
        </div>
        <div>
          <Button
            theme={cx({
              secondary: selected,
              'secondary-alt': !selected,
            })}
            size="xs"
            onClick={onToggleSelected}
          >
            {selected ? 'Remove' : 'Add'}
          </Button>
        </div>
      </header>

      <div className="flex">
        {tags.map((t, i) => (
          <div
            key={`${t.id}`}
            className={cx({
              'ml-1.5': i !== 0,
            })}
          >
            <Tag
              className={cx({
                [`${t.className}`]: !!t.className,
              })}
            >
              {t.name}
            </Tag>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm opacity-50 clamp-2">{description}</div>
    </div>
  );
};

export default Item;
