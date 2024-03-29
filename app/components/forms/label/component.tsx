import React from 'react';

import { cn } from 'utils/cn';

const THEME = {
  dark: 'block font-heading font-medium text-xs text-white',
  light: 'block font-heading font-medium text-xs text-gray-700',
};

export interface LabelProps {
  id?: string;
  theme?: 'dark' | 'light';
  children: React.ReactNode;
  className?: string;
}

const LabelComponent = ({ id, theme = 'dark', children, className }: LabelProps, ref) => {
  return (
    <label
      className={cn({
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

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(LabelComponent);

export default Label;
