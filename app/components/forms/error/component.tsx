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
        'mb-5 rounded border border-red-600 bg-red-200 px-3 py-1 text-sm text-red-600': true,
        [className]: !!className,
      })}
    >
      {children}
    </div>
  );
};

export default Error;
