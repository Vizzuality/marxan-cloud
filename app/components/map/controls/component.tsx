import React from 'react';
import cx from 'classnames';

export interface ControlsProps {
  className?: string;
  children: React.ReactNode;
}

export const Controls: React.FC<ControlsProps> = ({
  className = 'absolute bottom-10 left-2',
  children,
}: ControlsProps) => {
  return (
    <div
      className={cx({
        'w-10': true,
        [className]: !!className,
      })}
    >
      {React.Children.map(children, (child, i) => {
        return (
          <div
            className={cx({
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
