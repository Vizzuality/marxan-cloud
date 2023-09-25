import React from 'react';

import { cn } from 'utils/cn';

export interface TagProps {
  children: React.ReactNode;
  className?: string | unknown;
}

export const Tag: React.FC<TagProps> = ({ children, className }: TagProps) => (
  <div
    className={cn({
      'relative inline-flex rounded': true,
      [`${className}`]: !!className,
      'bg-gray-300 text-black': !className,
    })}
  >
    <div
      className={cn({
        'flex-col px-2 py-1 text-sm leading-none': true,
      })}
    >
      <div className="flex-1">{children}</div>
    </div>
  </div>
);

export default Tag;
