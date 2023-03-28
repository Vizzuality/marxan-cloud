import React, { MutableRefObject } from 'react';

import { useInView } from 'react-intersection-observer';

import cx from 'classnames';

import Button from 'components/button';
import InfoButton from 'components/info-button';

export interface ItemProps {
  id: string | number;
  className?: string;
  name: string;
  categories?: number;
  description: string;
  scrollRoot?: MutableRefObject<HTMLDivElement | null>;
  selected?: boolean;
  onToggleSelected?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Item: React.FC<ItemProps> = ({
  className,
  name,
  categories = 0,
  description,
  scrollRoot,
  selected,
  onToggleSelected,
}: ItemProps) => {
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
    ...(scrollRoot && {
      root: scrollRoot.current,
    }),
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
    </div>
  );
};

export default Item;
