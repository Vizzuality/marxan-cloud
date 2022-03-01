import React, { MouseEventHandler } from 'react';

import classnames from 'classnames';
import { format } from 'd3';

import Icon from 'components/icon';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

export interface ItemProps {
  id: string;
  name: string;
  current: {
    percent: number;
    value: string;
    unit: string;
  }
  target: {
    percent: number;
    value: string;
    unit: string;
  }
  className?: string;
  highlighted?: boolean;
  onHighlight?: () => void;
  muted?: boolean;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
}

export const Item: React.FC<ItemProps> = ({
  name, current, target, className, highlighted, muted, onMouseEnter, onMouseLeave, onHighlight,
}: ItemProps) => {
  return (
    <div
      className={classnames({
        'text-white px-4 pt-1 pb-4 border-l-4 border-purple-700 transition-opacity duration-300': true,
        'opacity-20': muted,
        [className]: className !== undefined && className !== null,
      })}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-between">
        <div className="pt-1 mr-4 overflow-hidden text-sm flex-shrink-1 overflow-ellipsis whitespace-nowrap font-heading">
          {name}
        </div>
        <button
          type="button"
          className="flex items-center justify-between flex-shrink-0 px-2 py-1 text-xs border border-transparent focus:border-white rounded-4xl"
          onClick={onHighlight}
        >
          {highlighted ? 'Lowlight on map' : 'Highlight on map'}
          <Icon icon={highlighted ? HIDE_SVG : SHOW_SVG} className="w-5 h-5 ml-3" />
        </button>
      </div>
      <div className="flex justify-start">
        <div className="mr-5">
          <div className="inline-block w-3 h-3 mr-3 align-middle bg-purple-700 rounded-sm" />
          <span className="text-sm">
            Current:
            {' '}
            {format('.2~%')(current.percent)}
            {' '}
            (
            {current.value}
            {' '}
            {current.unit}
            )
          </span>
        </div>
        <div>
          <div className="inline-block w-3 h-3 mr-3 align-middle rounded-sm w- bg-gradient-repeat-to-br from-gray-100 with-stripes to-gray-800" />
          <span className="text-sm">
            Target:
            {' '}
            {format('.2~%')(target.percent)}
            {' '}
            (
            {target.value}
            {' '}
            {target.unit}
            )
          </span>
        </div>
      </div>
      <div className="mt-4 relative h-2.5 bg-gray-600 rounded-sm">
        <div className="absolute h-full bg-purple-700 rounded-sm" style={{ width: `${current.percent * 100}%` }} />
        <div className="absolute top-1/2 left-1 transform -translate-y-1/2 h-1.5 border border-black bg-gradient-repeat-to-br from-gray-100 with-stripes to-gray-800 rounded-md" style={{ width: `${target.percent * 100}%` }} />
      </div>
    </div>
  );
};

export default Item;
