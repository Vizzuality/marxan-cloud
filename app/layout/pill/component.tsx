import React, { ReactNode } from 'react';
import cx from 'classnames';

export interface PillProps {
  children: ReactNode
}

export const Pill: React.FC<PillProps> = ({ children }:PillProps) => {
  return (
    <div
      className={cx({
        'px-10 py-10 bg-gray-700 rounded-4xl ring-1 ring-gray-500 ring-offset-8 ring-inset ring-offset-gray-700': true,
      })}
    >
      {children}
    </div>
  );
};

export default Pill;
