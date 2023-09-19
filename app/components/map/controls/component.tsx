import React from 'react';

import { useAppSelector } from 'store/hooks';

import { cn } from 'utils/cn';

export interface ControlsProps {
  className?: string;
  children: React.ReactNode;
}

export const Controls: React.FC<ControlsProps> = ({
  className = 'absolute w-6 bottom-[62px]',
  children,
}: ControlsProps) => {
  const { isSidebarOpen } = useAppSelector((state) => state['/projects/[id]']);

  return (
    <div
      className={cn({
        'left-[570px]': isSidebarOpen,
        'left-6': !isSidebarOpen,
        [className]: !!className,
      })}
    >
      {React.Children.map(children, (child, i) => {
        return (
          <div
            className={cn({
              'mt-2': i !== 0,
            })}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default Controls;
