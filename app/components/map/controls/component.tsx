import React from 'react';
import cx from 'classnames';

export interface ControlsProps {
  className?: string;
  children: React.ReactNode;
}

export const Controls: React.FC<ControlsProps> = ({
  className = '',
  children,
}: ControlsProps) => {
  return (
    <div
      className={cx({
        'w-10': true,
        [className]: !!className,
      })}
    >
      {children}
    </div>
  );
};

export default Controls;
