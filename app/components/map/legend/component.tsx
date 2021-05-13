import React, { useCallback, useState } from 'react';
import cx from 'classnames';

import Icon from 'components/icon';
import LEGEND_SVG from 'svgs/map/legend.svg?sprite';
import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';

import SortableList from './sortable/list';

export interface LegendProps {
  className?: string;
  children: React.ReactNode;
  onChangeOrder: (id: string[]) => void;
}

export const Legend: React.FC<LegendProps> = ({
  children,
  className = '',
  onChangeOrder,
}: LegendProps) => {
  const [active, setActive] = useState(true);

  const onToggleActive = useCallback(() => {
    setActive(!active);
  }, [active]);

  return (
    <div
      className={cx({
        'bg-black rounded-3xl': true,
        [className]: !!className,
      })}
    >
      <button
        type="button"
        className="relative flex items-center w-full px-5 py-3 space-x-2 text-xs text-white uppercase font-heading focus:outline-none"
        onClick={onToggleActive}
      >
        <Icon icon={LEGEND_SVG} className="w-4 h-4 text-gray-300" />
        <span>Legend</span>

        <Icon
          icon={ARROW_DOWN_SVG}
          className={cx({
            'absolute w-3 h-3 transition-transform transform -translate-y-1/2 text-primary-500 top-1/2 right-5': true,
            'rotate-180': active,
          })}
        />
      </button>

      {active && (
        <div className="pb-2.5">
          <SortableList
            onChangeOrder={onChangeOrder}
          >
            {children}
          </SortableList>
        </div>
      )}
    </div>
  );
};

export default Legend;
