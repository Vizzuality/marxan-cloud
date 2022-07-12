import React, { MutableRefObject } from 'react';

import { useInView } from 'react-intersection-observer';

import cx from 'classnames';

import Button from 'components/button';
import InfoButton from 'components/info-button';
import Tag from 'components/tag';

export interface ItemProps {
  id: string | number;
  className?: string;
  name: string;
  categories?: number;
  description: string;
  tag: 'bioregional' | 'species';
  source?: string;
  scrollRoot?: MutableRefObject<HTMLDivElement | null>;
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
  scrollRoot,
  selected,
  onToggleSelected,
}: ItemProps) => {
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    ...scrollRoot && {
      root: scrollRoot.current,
    },
  });

  return (
    <div
      ref={ref}
      className={cx({
        'bg-white px-0 py-6 text-black': true,
        [className]: !!className,
        invisible: !inView,
      })}
    >
      <header className="flex items-baseline justify-between">
        <div className="flex space-x-2">
          <h2 className="text-sm font-medium font-heading">{name}</h2>

          {description && (
            <InfoButton
              theme="secondary"
            >
              <div className="text-sm opacity-50">
                {description}
              </div>
            </InfoButton>
          )}

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
    </div>
  );
};

export default Item;
