import React from 'react';

import cx from 'classnames';

export interface LegendTypeBasicProps {
  className?: string;
  items: Array<{
    value: string;
    color: string;
  }>;
}

export const LegendTypeBasic: React.FC<LegendTypeBasicProps> = ({
  className = '',
  items,
}: LegendTypeBasicProps) => {
  return (
    <div
      className={cx({
        [className]: !!className,
      })}
    >
      <ul className="flex w-full flex-col space-y-1">
        {items.map(({ value, color }) => (
          <li key={`${value}`} className="flex space-x-2 text-xs">
            <div
              className="mt-0.5 h-3 w-3 flex-shrink-0 rounded"
              style={{
                backgroundColor: color,
              }}
            />
            <div>{value}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LegendTypeBasic;
