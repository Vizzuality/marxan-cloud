import React from 'react';
import cx from 'classnames';

const THEME = {
  dark: 'block text-xs text-white',
  light: 'block text-xs text-gray-800',
};

export interface LabelProps {
  id?: string;
  theme?: 'dark' | 'light';
  children: React.ReactNode;
  className?: string;
}

const LabelComponent = (
  {
    id, theme = 'dark', children, className,
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
