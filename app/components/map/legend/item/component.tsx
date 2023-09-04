import React, { Children, isValidElement, ReactNode, useMemo, useState } from 'react';

import { useNumberFormatter } from '@react-aria/i18n';

import Slider from 'components/forms/slider';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';
import { cn } from 'utils/cn';

import OPACITY_SVG from 'svgs/map/opacity.svg?sprite';
import DRAG_SVG from 'svgs/ui/drag.svg?sprite';
import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

export interface LegendItemProps {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  sortable?: {
    enabled: boolean;
    handle: boolean;
    handleIcon: React.ReactNode;
  };
  listeners?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  settingsManager?: {
    opacity: boolean;
    visibility: boolean;
  };
  settings?: {
    opacity: number;
    visibility: boolean;
  };
  theme?: 'dark' | 'light';
  className?: string;
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
  className,
  theme = 'dark',
  onChangeOpacity,
  onChangeVisibility,
}: LegendItemProps) => {
  const [openOpacity, setOpenOpacity] = useState(false);

  const validChildren = useMemo(() => {
    const chldn = Children.map(children, (Child) => {
      return isValidElement(Child);
    });
    return chldn && chldn.some((c) => !!c);
  }, [children]);

  const { opacity = 1, visibility = true } = settings || {};

  const { format } = useNumberFormatter({
    style: 'percent',
  });

  return (
    <div
      key={id}
      className={cn({
        'px-5 py-2.5': !className,
        [className]: !!className,
      })}
    >
      <header className="relative mb-1 flex justify-between">
        <div
          className={cn({
            relative: true,
            'pl-5': icon,
          })}
        >
          {icon && <div className="absolute left-0 top-0">{icon}</div>}
          <div
            className={cn({
              'font-heading text-sm': true,
              'text-white': theme === 'dark' || !theme,
              'text-gray-700': theme === 'light',
            })}
          >
            {name}
          </div>
        </div>

        {sortable?.handle && (
          <button
            aria-label="drag"
            type="button"
            className="cursor-pointer text-gray-400 hover:text-white"
            {...listeners}
            {...attributes}
          >
            <Icon className="w-4 " icon={DRAG_SVG} />
          </button>
        )}

        <div className="flex space-x-3">
          {settingsManager?.opacity && (
            <div className="flex">
              <Tooltip
                arrow
                placement="top"
                trigger={openOpacity ? 'manual' : 'mouseenter focus'}
                content={
                  <div className="rounded bg-white p-2 text-gray-500">
                    Opacity ({format(opacity)})
                  </div>
                }
              >
                <div>
                  <Tooltip
                    arrow
                    placement="top-start"
                    trigger="click"
                    interactive
                    onShow={() => {
                      setOpenOpacity(true);
                    }}
                    onHide={() => {
                      setOpenOpacity(false);
                    }}
                    content={
                      <div className="w-60 rounded bg-white px-6 pb-4 pt-1.5 text-gray-500">
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
                    }
                  >
                    <button
                      aria-label="manage-opacity"
                      type="button"
                      className={cn({
                        'flex h-5 w-5 items-center justify-center text-white': true,
                        'text-gray-300': opacity !== 1,
                      })}
                    >
                      <Icon className="h-4 w-4 pt-px" icon={OPACITY_SVG} />
                    </button>
                  </Tooltip>
                </div>
              </Tooltip>
            </div>
          )}

          {settingsManager?.visibility && (
            <div className="flex">
              <Tooltip
                arrow
                placement="top"
                content={<div className="rounded bg-white p-2 text-gray-500">Visibility</div>}
              >
                <button
                  aria-label="manage-visibility"
                  type="button"
                  onClick={onChangeVisibility}
                  className={cn({
                    'flex h-5 w-5 items-center justify-center text-white': true,
                    'text-gray-300': !visibility,
                  })}
                >
                  <Icon className="h-4 w-4" icon={visibility ? SHOW_SVG : HIDE_SVG} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </header>

      <div className="text-sm text-gray-300">{description}</div>

      {validChildren && <div className="mt-2.5">{children}</div>}
    </div>
  );
};

export default LegendItem;
