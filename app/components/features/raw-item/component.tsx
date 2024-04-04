import React, { ComponentProps, MutableRefObject } from 'react';

import { useInView } from 'react-intersection-observer';

import Button from 'components/button';
import InfoButton from 'components/info-button';
import { cn } from 'utils/cn';

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
      className={cn({
        'bg-white px-0 py-6 text-black': true,
        [className]: !!className,
        invisible: !inView,
      })}
    >
      <header className="flex items-baseline justify-between">
        <div className="flex space-x-2">
          <h2 className="font-heading text-sm font-medium">{name}</h2>

          {description && (
            <InfoButton theme="secondary">
              <div className="text-sm opacity-50">{description}</div>
            </InfoButton>
          )}

          {!!categories && (
            <div className="ml-2 pl-2 text-sm underline">{`${categories} Categories`}</div>
          )}
        </div>
        <div>
          <Button
            theme={
              cn({
                secondary: selected,
                'secondary-alt': !selected,
              }) as ComponentProps<typeof Button>['theme']
            }
            className={cn({
              'text-gray-900': !selected,
            })}
            size="xs"
            onClick={onToggleSelected}
          >
            {selected ? 'Remove' : 'Add to scenario'}
          </Button>
        </div>
      </header>
    </div>
  );
};

export default Item;
