import React, { ReactNode } from 'react';
import cx from 'classnames';

export interface LegendItemProps {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode
}

export const LegendItem: React.FC<LegendItemProps> = ({
  id,
  name,
  description,
  icon,
}: LegendItemProps) => {
  return (
    <div
      key={id}
      className="p-2.5"
    >
      <header className="flex">
        <div
          className={cx({
            relative: true,
            'pl-5': icon,
          })}
        >
          {icon && (
            <div className="absolute top-0 left-0">
              {icon}
            </div>
          )}
          <div className="text-sm text-white font-heading">{name}</div>
        </div>
      </header>

      <div className="text-sm text-gray-300">
        {description}
      </div>
    </div>
  );
};

export default LegendItem;
