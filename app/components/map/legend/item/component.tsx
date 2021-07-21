import React, { ReactNode } from 'react';
import cx from 'classnames';

import Icon from 'components/icon';
import DRAG_SVG from 'svgs/ui/drag.svg?sprite';

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
  attributes?: Record<string, unknown>;
}

export const LegendItem: React.FC<LegendItemProps> = ({
  id,
  name,
  description,
  icon,
  children,
  sortable,
  listeners,
  attributes,
}: LegendItemProps) => {
  return (
    <div
      key={id}
      className="py-2.5 px-5"
    >
      <header className="relative flex justify-between mb-1">
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
            className="text-gray-400 cursor-pointer hover:text-white"
            {...listeners}
            {...attributes}
          >
            <Icon className="w-4 " icon={DRAG_SVG} />
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
