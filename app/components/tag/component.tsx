import React from 'react';
import cx from 'classnames';

import Icon from 'components/icon';
import CLOSE_SVG from 'svgs/ui/close.svg';

const SIZE = {
  s: 'text-sm px-1.5 py-1',
  base: 'text-sm px-3 py-1.5',
};

export interface TagProps {
  children: React.ReactNode;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  size: 's' | 'base';
  className?: string;
  removable?: boolean;
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void | unknown;
}

export const Tag: React.FC<TagProps> = ({
  children,
  color = 'text-white',
  bgColor = 'bg-gray-500',
  borderColor = 'border-gray-200',
  size = 'base',
  className,
  removable = false,
  onRemove,
  ...restProps
}: TagProps) => (
  <div
    className={cx({
      'relative inline-flex rounded': true,
      [color]: true,
      [bgColor]: true,
      [className]: !!className,
    })}
    {...restProps}
  >
    <div
      className={cx({
        'flex-col leading-none ': true,
        [SIZE[size]]: true,
      })}
    >
      <div className="flex-1">{children}</div>
    </div>

    {removable && (
      <div className="flex-col">
        <button
          type="button"
          className={cx({
            'block flex-1 border-l border-opacity-25 h-full focus:outline-none rounded-r': true,
            'hover:bg-gray-50 hover:bg-opacity-10': true,
            [SIZE[size]]: true,
            [borderColor]: true,
          })}
          onClick={onRemove}
        >
          <Icon className="w-2 h-2" icon={CLOSE_SVG} />
        </button>
      </div>
    )}
  </div>
);

export default Tag;
