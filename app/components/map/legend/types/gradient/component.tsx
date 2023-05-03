import React from 'react';

import cx from 'classnames';

import { useNumberFormatter } from '@react-aria/i18n';

export interface LegendTypeGradientProps {
  className?: {
    box?: string;
    bar?: string;
    labels?: string;
  };
  items: Array<{
    value: string;
    color: string;
  }>;
}

export const LegendTypeGradient: React.FC<LegendTypeGradientProps> = ({
  className = {},
  items,
}: LegendTypeGradientProps) => {
  const { format } = useNumberFormatter({
    style: 'decimal',
  });

  return (
    <div
      className={cx({
        [className?.box]: !!className?.box,
      })}
    >
      <div
        className={cx({
          'flex h-2 w-full': true,
          [className?.bar]: className?.bar,
        })}
        style={{
          backgroundImage: `linear-gradient(to right, ${items.map((i) => i.color).join(',')})`,
        }}
      />

      <ul className="mt-1 flex w-full justify-between">
        {items
          .filter(({ value }) => !!value)
          .map(({ value }) => (
            <li
              key={`${value}`}
              className={cx({
                'flex-shrink-0 text-xs': true,
                [className.labels]: className.labels,
              })}
            >
              {format(+parseInt(value, 10))}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default LegendTypeGradient;
