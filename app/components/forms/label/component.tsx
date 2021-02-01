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

const LabelComponent = (
  {
    id, theme = 'primary', children, className,
  }: LabelProps,
  ref,
) => {
  return (
    <label
      className={cx({
        [THEME[theme]]: true,
        [className]: !!className,
      })}
      htmlFor={id}
      ref={ref}
    >
      {children}
    </label>
  );
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  LabelComponent,
);

export default Label;
