import React, { ReactNode } from 'react';

import { cn } from 'utils/cn';

export interface WrapperProps {
  children: ReactNode;
  className?: string;
}

export const Wrapper: React.FC<WrapperProps> = ({ children, className }: WrapperProps) => {
  return (
    <div
      className={cn({
        'mx-auto flex w-full flex-col px-10 md:container': true,
        [className]: !!className,
      })}
    >
      {children}
    </div>
  );
};

export default Wrapper;
