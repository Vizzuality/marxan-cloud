import React, { ReactNode } from 'react';

import cx from 'classnames';

export interface ErrorProps {
  children: ReactNode;
  visible?: boolean;
  className?: string;
}

export const Error: React.FC<ErrorProps> = ({ children, visible, className }: ErrorProps) => {
  if (!visible) return null;

  return (
    <div
      className={cx({
        'mb-5 rounded border border-red-500 bg-red-100 px-3 py-1 text-sm text-red-500': true,
        [className]: !!className,
      })}
    >
      {children}
    </div>
  );
};

export default Error;
