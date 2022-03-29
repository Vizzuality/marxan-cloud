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
  items = [],
  intersections,
}: LegendTypeMatrixProps) => {
  return (
    <div className="flex items-center space-x-14">
      <div className="relative flex-shrink-0 w-16 py-12 ml-10">
        <p className="absolute text-xs font-medium text-white transform -translate-x-1/2 font-heading top-1 left-1/2">Always</p>
        <p className="absolute text-xs font-medium text-white transform -translate-x-1/2 font-heading bottom-1 left-1/2">Never</p>
        <div className="w-full transform rotate-45 preserve-3d">
          <div className="w-full" style={{ paddingBottom: '100%' }}>
            <div className="absolute top-0 left-0 flex flex-wrap w-full h-full">
              {intersections.map((i) => (
                <div key={i.id} className="relative block" style={{ background: `${i.color}`, width: `${100 / 11}%`, height: `${100 / 11}%` }} />
              ))}
            </div>

            <div className="absolute bottom-0 z-10 justify-between w-2 h-full text-white transform text-xxs left-full font-heading">
              <div className="absolute flex items-center h-px space-x-1 leading-none" style={{ bottom: `${(100 / 11) * 2}%` }}>
                <span className="relative block w-1 h-px bg-gray-300 top-px" />
                <span className="relative block transform -rotate-45">
                  <span>10</span>
                </span>
              </div>
              <div className="absolute flex items-center h-px space-x-1 leading-none" style={{ bottom: `${(100 / 11) * 6}%` }}>
                <span className="relative block w-1 h-px bg-gray-300 top-px" />
                <span className="relative block transform -rotate-45">
                  <span>50</span>
                </span>
              </div>
              <div className="absolute flex items-center h-px space-x-1 leading-none" style={{ bottom: '100%' }}>
                <span className="relative block w-1 h-px bg-gray-300 top-px" />
                <span className="relative block transform -rotate-45">
                  <span>100</span>
                </span>
              </div>
            </div>

            <div className="absolute z-10 justify-between w-2 h-full text-white origin-bottom transform rotate-90 -bottom-1 -left-1 text-xxs font-heading">
              <div className="absolute flex items-center h-px space-x-1 leading-none transform" style={{ bottom: `${100 - (100 / 11) * 2}%` }}>
                <span className="relative block w-1 h-px bg-gray-300 top-px" />
                <span className="relative block transform -rotate-180">
                  <span className="relative block transform rotate-45">10</span>
                </span>
              </div>
              <div className="absolute flex items-center h-px space-x-1 leading-none transform" style={{ bottom: `${100 - (100 / 11) * 6}%` }}>
                <span className="relative block w-1 h-px bg-gray-300 top-px" />
                <span className="relative block transform -rotate-180">
                  <span className="relative block transform rotate-45">50</span>
                </span>
              </div>
              <div className="absolute flex items-center h-px space-x-1 leading-none transform" style={{ bottom: '0%' }}>
                <span className="relative block w-1 h-px bg-gray-300 top-px" />
                <span className="relative block transform -rotate-180">
                  <span className="relative block transform rotate-45">100</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cx({
          [className]: !!className,
        })}
      >
        <ul className="flex flex-col w-full space-y-2">
          {items
            .map(({ value, color }) => (
              <li
                key={`${value}`}
                className="flex items-center space-x-2 text-xs font-heading"
              >
                <div
                  className="flex-shrink-0 w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: color,
                  }}
                />
                <div className="clamp-2">{value}</div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default LegendTypeMatrix;
