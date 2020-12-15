import React from 'react';
import cx from 'classnames';

const THEME = {
  primary: 'block text-xs text-white',
};

export interface LabelProps {
  id?: string;
  theme?: 'primary';
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({
  id,
  theme = 'primary',
  children,
  className,
}: LabelProps) => {
  return (
    <label
      className={cx({
        [THEME[theme]]: true,
        [className]: !!className,
      })}
      htmlFor={id}
    >
      {children}
    </label>
  );
};

export default Label;
