import React, { ReactNode } from 'react';
import cx from 'classnames';

export interface WrapperProps {
  children: ReactNode
}

export const Wrapper: React.FC<WrapperProps> = ({ children }:WrapperProps) => {
  return (
    <div
      className={cx({
        'container mx-auto lg:px-10 px-4 w-full h-full flex flex-col flex-grow': true,
      })}
    >
      {children}
    </div>
  );
};

export default Wrapper;
