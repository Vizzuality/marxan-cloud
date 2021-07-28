import React from 'react';
import cx from 'classnames';

export interface LegendTypeMatrixProps {
  className?: string;
  intersections: Array<{
    id: number;
    color: string;
  }>;
  items: Array<{
    value: string;
    color: string;
  }>;
}

export const LegendTypeMatrix: React.FC<LegendTypeMatrixProps> = ({
  className = '',
  items,
  intersections,
}: LegendTypeMatrixProps) => {
  return (
    <>
      <div className="relative p-12">
        <p className="absolute text-xs font-medium text-white pl-7 font-heading top-2">Always</p>
        <p className="absolute text-xs font-medium text-white pl-7 font-heading bottom-2">Never</p>
        <div className="transform rotate-45 w-min">
          <div className="grid grid-flow-col grid-rows-4">
            {intersections.map((i) => (
              <div key={i.id} className="w-6 h-6" style={{ background: `${i.color}` }} />
            ))}

          </div>
          <div className="absolute w-3 h-3 bg-white left-0.5 top-0.5" />
          <div className="absolute w-3 h-3 bg-gray-700 right-0.5 bottom-0.5" />
          <div className="absolute flex w-24 text-xs text-white font-heading -bottom-6 -left-6">
            <p className="transform -rotate-45">100%</p>
            <p className="transform -rotate-45">75%</p>
            <p className="transform -rotate-45">50%</p>
            <p className="transform -rotate-45">25%</p>
          </div>
          <div className="absolute flex w-24 text-xs text-white transform -rotate-90 top-6 left-16 font-heading">
            <p className="transform rotate-45">25%</p>
            <p className="transform rotate-45">50%</p>
            <p className="transform rotate-45">75%</p>
            <p className="transform rotate-45">100%</p>
          </div>
        </div>
      </div>

      <div
        className={cx({
          [className]: !!className,
        })}
      >
        <ul className="flex flex-col w-full space-y-3">
          {items
            .map(({ value, color }) => (
              <li
                key={`${value}`}
                className="flex items-center space-x-2 text-sm font-heading"
              >
                <div
                  className="flex-shrink-0 w-3 h-3 rounded-sm"
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

export default LegendTypeMatrix;
