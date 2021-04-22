import React from 'react';
import cx from 'classnames';

import Button from 'components/button';
import Tag from 'components/tag';

export interface ItemProps {
  id: string | number;
  className?: string;
  name: string;
  categories?: number;
  description: string;
  tag?: string;
  source?: string;
  selected?: boolean;
  onToggleSelected?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Item: React.FC<ItemProps> = ({
  className,
  name,
  categories = 0,
  description,
  tag,
  source,
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
      <header className="flex items-baseline justify-between">
        <div className="flex divide-x">
          <h2 className="text-sm font-medium font-heading">{name}</h2>

          {!!categories && (
            <div className="pl-2 ml-2 text-sm underline">
              {`${categories} Categories`}
            </div>
          )}
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

      <div className="flex mt-1">
        <div>
          <Tag
            className={cx({
              'text-black bg-green-300': tag === 'bioregional',
              'text-black bg-yellow-300': tag === 'species',
            })}
          >
            {tag === 'bioregional' && 'Bioregional'}
            {tag === 'species' && 'Species'}
          </Tag>
        </div>

        {source && (
          <div
            className={cx({
              'ml-1.5': true,
            })}
          >
            <Tag>
              {source}
            </Tag>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm opacity-50 clamp-2">{description}</div>
    </div>
  );
};

export default Item;
