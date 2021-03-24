import React, { ReactNode } from 'react';
import cx from 'classnames';

export interface PillProps {
  selected?: boolean;
  children: ReactNode
}

export const Pill: React.FC<PillProps> = ({ children, selected }:PillProps) => {
  return (
    <div
      className={cx({
        'px-10 bg-gray-700 rounded-4xl': true,
        'py-5': !selected,
        'ring-1 ring-gray-500 ring-offset-8 ring-inset ring-offset-gray-700 py-10': selected,
      })}
    >
      {children}
    </div>
  );
};

export default Pill;
