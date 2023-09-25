import React, { ReactNode } from 'react';

import { cn } from 'utils/cn';

export interface PillProps {
  selected?: boolean;
  children: ReactNode;
}

export const Pill: React.FC<PillProps> = ({ children, selected }: PillProps) => {
  return (
    <div
      className={cn({
        'rounded-[40px] bg-gray-800': true,
        'ring-1 ring-inset ring-gray-600 ring-offset-8 ring-offset-gray-800': selected,
        'flex flex-grow flex-col overflow-hidden': true,
      })}
    >
      <div
        className={cn({
          'flex flex-grow flex-col overflow-hidden px-10': true,
          'py-10': selected,
          'py-3': !selected,
        })}
      >
        <div className="flex flex-grow flex-col overflow-hidden px-0.5 py-0.5">{children}</div>
      </div>
    </div>
  );
};

export default Pill;
