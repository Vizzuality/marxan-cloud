import React from 'react';
import cx from 'classnames';

export interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  className = 'text-black bg-gray-300',
}: TagProps) => (
  <div
    className={cx({
      'relative inline-flex rounded': true,
      [className]: !!className,
    })}
  >
    <div
      className={cx({
        'flex-col leading-none text-sm px-2 py-1': true,
      })}
    >
      <div className="flex-1">{children}</div>
    </div>
  </div>
);

export default Tag;
