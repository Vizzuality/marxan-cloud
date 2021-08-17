import React, {
  Children, isValidElement, ReactNode,
} from 'react';

import cx from 'classnames';

import Slider from 'components/forms/slider';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import OPACITY_SVG from 'svgs/map/opacity.svg?sprite';
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
  opacityManager?: boolean;
  onChangeOpacity?: () => void;
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
  opacityManager,
  onChangeOpacity,
}: LegendItemProps) => {
  const validChildren = Children.map(children, (Child) => {
    return isValidElement(Child);
  }).some((c) => !!c);

  return (
    <div
      key={id}
      className="px-5 py-2.5"
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

      {opacityManager && (
        <div className="mt-2.5 flex">
          <Tooltip
            arrow
            placement="right-start"
            trigger="click"
            interactive
            content={(
              <div
                className="px-4 py-3.5 text-gray-500 bg-white rounded w-60"
              >
                <Slider
                  labelRef={null}
                  theme="light"
                  defaultValue={0.5}
                  formatOptions={{
                    style: 'percent',
                  }}
                  maxValue={1}
                  minValue={0.01}
                  step={0.01}
                  onChange={onChangeOpacity}
                />
              </div>
            )}
          >
            <button
              type="button"
            >
              <Icon className="w-5" icon={OPACITY_SVG} />
            </button>
          </Tooltip>
        </div>
      )}

      {validChildren && (
        <div className="mt-2.5">
          {children}
        </div>
      )}
    </div>
  );
};

export default LegendItem;
