import React, { ReactNode } from 'react';

import { cn } from 'utils/cn';

export interface WrapperProps {
  children: ReactNode;
}

export const Wrapper: React.FC<WrapperProps> = ({ children }: WrapperProps) => {
  return (
    <div
      className={cn({
        'mx-auto flex h-full w-full flex-grow flex-col px-10 md:container': true,
      })}
    >
      {children}
    </div>
  );
};

export default Wrapper;
