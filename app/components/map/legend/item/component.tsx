import React, { ReactNode } from 'react';
import cx from 'classnames';

export interface LegendItemProps {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode,
  children?: ReactNode;
  sortable?: {
    enabled: boolean;
    handle: boolean;
    handleIcon: React.ReactNode,
  };
  listeners?: Record<string, unknown>;
}

export const LegendItem: React.FC<LegendItemProps> = ({
  id,
  name,
  description,
  icon,
  children,
  sortable,
  listeners,
}: LegendItemProps) => {
  return (
    <div
      key={id}
      className="py-2.5 px-5"
    >
      <header className="relative flex">
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

        {sortable?.handle && (
          <button
            type="button"
            className="absolute top-0 right-0 text-white"
            {...listeners}
          >
            handle
          </button>
        )}
      </header>

      <div className="text-sm text-gray-300">
        {description}
      </div>

      {children && (
        <div className="mt-2.5">
          {children}
        </div>
      )}
    </div>
  );
};

export default LegendItem;
