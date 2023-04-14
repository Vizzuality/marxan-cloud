import React, { useMemo, useCallback, Children, isValidElement } from 'react';

import cx from 'classnames';

import Icon from 'components/icon';

import LEGEND_SVG from 'svgs/map/legend.svg?sprite';
import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';

import SortableList from './sortable/list';

export interface LegendProps {
  open: boolean;
  className?: string;
  children: React.ReactNode;
  maxHeight: string | number;
  sortable?: {
    enabled: boolean;
    handle: boolean;
    handleIcon: React.ReactNode;
  };
  onChangeOrder?: (id: string[]) => void;
  onChangeOpen?: (open: boolean) => void;
}

export const Legend: React.FC<LegendProps> = ({
  open,
  children,
  className = '',
  maxHeight,
  sortable,
  onChangeOpen,
  onChangeOrder,
}: LegendProps) => {
  const isChildren = useMemo(() => {
    return !!Children.count(Children.toArray(children).filter((c) => isValidElement(c)));
  }, [children]);

  const onToggleOpen = useCallback(() => {
    onChangeOpen(!open);
  }, [open, onChangeOpen]);

  return (
    <div
      className={cx({
        'flex w-full flex-grow flex-col overflow-hidden rounded-3xl bg-black': true,
        hidden: !isChildren,
        [className]: !!className,
      })}
    >
      <button
        type="button"
        className="relative flex w-full items-center space-x-2 px-5 py-3 font-heading text-xs uppercase text-white focus:outline-none"
        onClick={onToggleOpen}
      >
        <Icon icon={LEGEND_SVG} className="h-4 w-4 text-gray-300" />
        <span>Legend</span>

        <Icon
          icon={ARROW_DOWN_SVG}
          className={cx({
            'absolute right-5 top-1/2 h-3 w-3 -translate-y-1/2 transform text-primary-500 transition-transform':
              true,
            'rotate-180': !open,
            'rotate-0': open,
          })}
        />
      </button>

      {open && isChildren && (
        <div
          className="relative flex flex-grow flex-col"
          style={{
            maxHeight,
          }}
        >
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-3 w-full bg-gradient-to-b from-black via-black" />
          <div className="overflow-y-auto overflow-x-hidden">
            <div className="divide-y divide-gray-600 divide-opacity-50 py-2">
              {!!sortable && (
                <SortableList sortable={sortable} onChangeOrder={onChangeOrder}>
                  {children}
                </SortableList>
              )}

              {!sortable && children}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-3 w-full bg-gradient-to-t from-black via-black" />
        </div>
      )}
    </div>
  );
};

export default Legend;
