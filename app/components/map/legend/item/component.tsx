import React, {
  Children, isValidElement, ReactNode,
  useState,
} from 'react';

import { useNumberFormatter } from '@react-aria/i18n';
import cx from 'classnames';

import Slider from 'components/forms/slider';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import OPACITY_SVG from 'svgs/map/opacity.svg?sprite';
import DRAG_SVG from 'svgs/ui/drag.svg?sprite';
import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

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
  settingsManager?: {
    opacity: boolean,
    visibility: boolean,
  }
  settings?: {
    opacity: number,
    visibility: boolean,
  }
  onChangeOpacity?: () => void;
  onChangeVisibility?: () => void;
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
  settingsManager,
  settings,
  onChangeOpacity,
  onChangeVisibility,
}: LegendItemProps) => {
  const [openOpacity, setOpenOpacity] = useState(false);

  const validChildren = Children.map(children, (Child) => {
    return isValidElement(Child);
  }).some((c) => !!c);

  const { opacity = 1, visibility = true } = settings || {};

  const { format } = useNumberFormatter({
    style: 'percent',
  });

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

      <div className="flex space-x-3">
        {settingsManager?.opacity && (
          <div className="mt-2.5 flex">
            <Tooltip
              arrow
              placement="top"
              trigger={openOpacity ? 'manual' : 'mouseenter focus'}
              content={(
                <div
                  className="p-2 text-gray-500 bg-white rounded"
                >
                  Opacity (
                  {format(opacity)}
                  )
                </div>
              )}
            >
              <div>
                <Tooltip
                  arrow
                  placement="top-start"
                  trigger="click"
                  interactive
                  onShow={() => { setOpenOpacity(true); }}
                  onHide={() => { setOpenOpacity(false); }}
                  content={(
                    <div
                      className="px-6 pt-1.5 pb-4 text-gray-500 bg-white rounded w-60"
                    >
                      <Slider
                        labelRef={null}
                        theme="dark-small"
                        defaultValue={opacity}
                        formatOptions={{
                          style: 'percent',
                        }}
                        maxValue={1}
                        minValue={0}
                        step={0.01}
                        onChange={onChangeOpacity}
                      />
                    </div>
                  )}
                >
                  <button
                    type="button"
                    className={cx({
                      'block text-white': true,
                      'text-gray-300': opacity !== 1,
                    })}
                  >
                    <Icon className="w-5 h-5 pt-px" icon={OPACITY_SVG} />
                  </button>
                </Tooltip>
              </div>
            </Tooltip>
          </div>
        )}

        {settingsManager?.visibility && (
          <div className="mt-2.5 flex">
            <Tooltip
              arrow
              placement="top"
              content={(
                <div
                  className="p-2 text-gray-500 bg-white rounded"
                >
                  Visibility
                </div>
              )}
            >
              <button
                type="button"
                onClick={onChangeVisibility}
                className={cx({
                  'block text-white': true,
                  'text-gray-300': !visibility,
                })}
              >
                <Icon className="w-5 h-5" icon={visibility ? SHOW_SVG : HIDE_SVG} />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {validChildren && (
        <div className="mt-2.5">
          {children}
        </div>
      )}
    </div>
  );
};

export default LegendItem;
