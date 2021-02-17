import React, { ReactNode } from 'react';
import cx from 'classnames';

export interface PillProps {
  children: ReactNode
}

export const Pill: React.FC<PillProps> = ({ children }:PillProps) => {
  return (
    <div
      className={cx({
        'px-10 py-10 bg-gray-600 rounded-3xl': true,
      })}
    >
      {children}
    </div>
  );
};

export default Pill;
