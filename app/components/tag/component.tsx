import React from 'react';

import cx from 'classnames';

export interface TagProps {
  children: React.ReactNode;
  className?: string | unknown;
}

export const Tag: React.FC<TagProps> = ({ children, className }: TagProps) => (
  <div
    className={cx({
      'relative inline-flex rounded': true,
      [`${className}`]: !!className,
      'bg-gray-200 text-black': !className,
    })}
  >
    <div
      className={cx({
        'flex-col px-2 py-1 text-sm leading-none': true,
      })}
    >
      <div className="flex-1">{children}</div>
    </div>
  </div>
);

export default Tag;
