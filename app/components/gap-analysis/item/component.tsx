import React, { MouseEventHandler, useEffect, useMemo, useRef, useState } from 'react';

import { useNumberFormatter } from '@react-aria/i18n';

import Icon from 'components/icon';
import Tooltip from 'components/tooltip';
import { cn } from 'utils/cn';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

export interface ItemProps {
  id: string;
  name: string;
  current: {
    percent: number;
  };
  target: {
    percent: number;
  };
  onTarget: boolean;
  className?: string;
  highlighted?: boolean;
  onHighlight?: () => void;
  muted?: boolean;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
}

export const Item: React.FC<ItemProps> = ({
  name,
  current,
  target,
  className,
  onTarget,
  highlighted,
  muted,
  onMouseEnter,
  onMouseLeave,
  onHighlight,
}: ItemProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartEl, setChartEl] = useState(null);
  const percentFormatter = useNumberFormatter({ style: 'percent', maximumFractionDigits: 4 });

  const metStyles = useMemo(() => {
    if (chartEl) {
      const tWidth = 85 / 2;
      const { width } = chartEl.getBoundingClientRect();

      const middle = width * current.percent > tWidth && width * current.percent < width - tWidth;
      const left = width * current.percent < tWidth;
      const right = width * current.percent > width - tWidth;

      return {
        'translate-x-0': left,
        '-translate-x-1/2': middle,
        '-translate-x-full': right,
      };
    }
    return {
      '-translate-x-1/2': true,
    };
  }, [current, chartEl]);

  useEffect(() => {
    setChartEl(chartRef.current);
  }, [chartEl]);

  return (
    <div
      className={cn({
        'relative overflow-hidden border-l-4 px-4 pb-4 pt-1 text-white transition-opacity duration-300':
          true,
        'opacity-20': muted,
        'border-purple-800': true,
        'pb-8': !onTarget,
        [className]: className !== undefined && className !== null,
      })}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="grid auto-cols-auto grid-cols-2 justify-between gap-2">
        <Tooltip
          content={<div className="rounded bg-white p-2 text-gray-600">{name}</div>}
          placement="top-start"
          delay={[400, null]}
          offset={[-10, -34]}
        >
          <div className="overflow-hidden overflow-ellipsis whitespace-nowrap pt-1 font-heading text-sm">
            {name}
          </div>
        </Tooltip>

        <button
          type="button"
          className="flex items-center justify-end rounded-[40px] border border-transparent px-2 py-1 text-xs focus:border-white"
          onClick={onHighlight}
        >
          <span>{highlighted ? 'Lowlight on map' : 'Highlight on map'}</span>
          <Icon icon={highlighted ? HIDE_SVG : SHOW_SVG} className="ml-3 h-5 w-5" />
        </button>
      </div>
      <div className="flex justify-start">
        <div className="mr-5">
          <div className="mr-3 inline-block h-3 w-3 rounded-sm bg-purple-800 align-middle" />
          <span className="text-sm">Current: {percentFormatter.format(current.percent)}</span>
        </div>
        <div>
          <div className="w- with-stripes mr-3 inline-block h-3 w-3 rounded-sm bg-gradient-repeat-to-br from-gray-200 to-gray-900 align-middle" />
          <span className="text-sm">Target: {percentFormatter.format(target.percent)}</span>
        </div>
      </div>
      <div ref={chartRef} className="relative mt-4 h-2.5 rounded-sm bg-gray-700">
        <div
          className="absolute h-full rounded-sm bg-purple-800"
          style={{ width: `${current.percent * 100}%` }}
        />
        <div
          className="with-stripes absolute left-1 top-1/2 h-1.5 -translate-y-1/2 transform rounded-md border border-black bg-gradient-repeat-to-br from-gray-200 to-gray-900"
          style={{ width: `${target.percent * 100}%` }}
        />

        {!onTarget && (
          <div
            className="absolute top-1/2 h-4 w-px -translate-y-1/2 transform bg-red-600"
            style={{
              left: `${current.percent * 100}%`,
            }}
          >
            <div
              className={cn({
                'absolute left-1/2 top-full mt-2.5 -translate-y-1/2 transform whitespace-nowrap text-xs text-red-600':
                  true,
                ...metStyles,
              })}
            >
              Target not met
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Item;
