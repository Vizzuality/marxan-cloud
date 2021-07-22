import React from 'react';
import cx from 'classnames';

export interface LegendTypeGridProps {
  className?: string;
  items: Array<{
    value: string;
    color: string;
  }>;
}

export const LegendTypeGrid: React.FC<LegendTypeGridProps> = ({
  className = '',
  items,
}: LegendTypeGridProps) => {
  return (
    <>
      <div className="relative p-16">
        <p className="absolute pl-6 text-base font-medium text-white font-heading top-1">Always</p>
        <p className="absolute pl-6 font-medium text-white font-heading bottom-1">Never</p>
        <div className="grid grid-flow-col grid-rows-4 transform rotate-45 border border-white w-min">
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
          <div className="w-6 h-6 border border-primary-200" />
        </div>
      </div>

      <div
        className={cx({
          [className]: !!className,
        })}
      >
        <ul className="flex flex-col w-full space-y-1">
          {items
            .map(({ value, color }) => (
              <li
                key={`${value}`}
                className="flex space-x-2 text-xs"
              >
                <div
                  className="flex-shrink-0 w-3 h-3 mt-0.5 rounded"
                  style={{
                    backgroundColor: color,
                  }}
                />
                <div>{value}</div>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};

export default LegendTypeGrid;
