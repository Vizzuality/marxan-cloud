import React from 'react';
import cx from 'classnames';

export interface LegendTypeMatrixProps {
  className?: string;
  items: Array<{
    value: string;
    color: string;
  }>;
}

const intersections = [
  {
    id: 1,
    color: '#9EB6B8',
  },
  {
    id: 2,
    color: '#9EB6B8',
  },
  {
    id: 3,
    color: '#6A9A9B',
  },
  {
    id: 4,
    color: '#3C7B7E',
  },
  {
    id: 5,
    color: '#CCBDA0',
  },
  {
    id: 6,
    color: '#97A38A',
  },
  {
    id: 7,
    color: '#648975',
  },
  {
    id: 8,
    color: '#366E5F',
  },
  {
    id: 9,
    color: '#C5A66B',
  },
  {
    id: 10,
    color: '#918E5C',
  },
  {
    id: 11,
    color: '#5E774D',
  },
  {
    id: 12,
    color: '#30603F',
  },
  {
    id: 13,
    color: '#BD8D3B',
  },
  {
    id: 14,
    color: '#8B7931',
  },
  {
    id: 15,
    color: '#586527',
  },
  {
    id: 16,
    color: '#2A511E',
  },
];

export const LegendTypeMatrix: React.FC<LegendTypeMatrixProps> = ({
  className = '',
  items,
}: LegendTypeMatrixProps) => {
  return (
    <>
      <div className="relative p-16">
        <p className="absolute pl-6 text-xs font-medium text-white font-heading top-1">Always</p>
        <p className="absolute pl-6 text-xs font-medium text-white font-heading bottom-1">Never</p>
        <div className="transform rotate-45 w-min">
          <div className="grid grid-flow-col grid-rows-4">
            {intersections.map((i) => (
              <div key={i.id} className="w-6 h-6" style={{ background: `${i.color}` }} />
            ))}
          </div>
          <div className="absolute flex w-24 text-xs text-white font-heading -bottom-6 -left-6">
            <p className="transform -rotate-45">100%</p>
            <p className="transform -rotate-45">75%</p>
            <p className="transform -rotate-45">50%</p>
            <p className="transform -rotate-45">25%</p>
          </div>
          <div className="absolute flex w-24 text-xs text-white transform -rotate-90 top-7 left-16 font-heading">
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

export default LegendTypeMatrix;
