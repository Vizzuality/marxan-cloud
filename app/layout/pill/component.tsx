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
        'bg-gray-700 rounded-4xl': true,
        'ring-1 ring-gray-500 ring-offset-8 ring-inset ring-offset-gray-700': selected,
        'h-full overflow-hidden': true,
      })}
    >
      <div
        className={cx({
          'h-full px-10 overflow-hidden': true,
          'py-10': selected,
          'py-5': !selected,
        })}
      >
        <div className="flex flex-col h-full overflow-hidden px-0.5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Pill;
