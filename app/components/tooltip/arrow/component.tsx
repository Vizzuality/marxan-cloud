import React from 'react';

import { cn } from 'utils/cn';

export interface ArrowProps {
  className?: string;
  'data-placement'?: string;
}

export const Arrow: React.FC<ArrowProps> = (props: ArrowProps) => {
  const { 'data-placement': placement, className } = props;

  return (
    <div
      {...props}
      className={cn({
        '-bottom-1': placement && placement.includes('top'),
        '-top-1': placement && placement.includes('bottom'),
        '-right-1': placement && placement.includes('left'),
        '-left-1': placement && placement.includes('right'),
      })}
    >
      <div
        className={cn({
          'h-2 w-2 rotate-45 transform bg-white': true,
          [className]: !!className,
        })}
      />
    </div>
  );
};

export default Arrow;
