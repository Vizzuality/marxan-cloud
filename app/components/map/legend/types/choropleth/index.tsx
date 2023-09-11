import React from 'react';

import cx from 'classnames';

export interface LegendTypeChoroplethProps {
  className?: string;
  items: Array<{
    value: string;
    color: string;
  }>;
}

export const LegendTypeChoropleth: React.FC<LegendTypeChoroplethProps> = ({
  className = '',
  items,
}: LegendTypeChoroplethProps) => {
  return (
    <div
      className={cx({
        [className]: !!className,
      })}
    >
      <ul className="flex w-full">
        {items.map(({ color }) => (
          <li
            key={`${color}`}
            className="h-2 flex-shrink-0"
            style={{
              width: `${100 / items.length}%`,
              backgroundColor: color,
            }}
          />
        ))}
      </ul>

      <ul className="mt-1 flex w-full">
        {items.map(({ value }) => (
          <li
            key={`${value}`}
            className="flex-shrink-0 text-center text-xs"
            style={{
              width: `${100 / items.length}%`,
            }}
          >
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LegendTypeChoropleth;
