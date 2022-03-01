import React from 'react';

import cx from 'classnames';
import { dotFormat } from 'utils/units';

export interface LegendTypeGradientProps {
  className?: {
    box?: string,
    bar?: string;
    labels?: string;
  };
  items: Array<{
    value: string;
    color: string;
  }>;
}

export const LegendTypeGradient: React.FC<LegendTypeGradientProps> = ({
  className,
  items,
}: LegendTypeGradientProps) => {
  return (
    <div
      className={cx({
        [className.box]: !!className.box,
      })}
    >
      <div
        className={cx({
          'flex w-full h-2': true,
          [className.bar]: className.bar,
        })}
        style={{
          backgroundImage: `linear-gradient(to right, ${items.map((i) => i.color).join(',')})`,
        }}
      />

      <ul className="flex justify-between w-full mt-1">
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
              {dotFormat(value)}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default LegendTypeGradient;
