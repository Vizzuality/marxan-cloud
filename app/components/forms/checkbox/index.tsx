import React, { InputHTMLAttributes } from 'react';

import { cn } from 'utils/cn';

const THEME = {
  dark: {
    base: 'bg-black border rounded-sm text-primary-500 focus:border-primary-500 focus:outline-none',
    status: {
      none: 'border-gray-600',
      valid: 'border-gray-600',
      error: 'border-red-600 focus:border-red-600',
      disabled: 'border-gray-600 opacity-50',
    },
  },
  light: {
    base: 'bg-white border rounded-sm text-primary-500 focus:border-primary-500 focus:outline-none',
    status: {
      none: 'border-gray-900',
      valid: 'border-gray-900',
      error: 'border-red-600 focus:border-red-600',
      disabled: 'border-gray-900 opacity-50',
    },
  },
};

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'dark' | 'light' | 'light-secondary';
  status?: 'none' | 'valid' | 'error' | 'disabled';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  theme = 'dark',
  status = 'none',
  disabled = false,
  className,
  ...props
}: CheckboxProps) => {
  const st = disabled ? 'disabled' : status;

  return (
    <input
      {...props}
      type="checkbox"
      disabled={disabled}
      className={cn({
        'form-checkbox': true,
        [THEME[theme].base]: true,
        [THEME[theme].status[st]]: true,
        [className]: !!className,
      })}
    />
  );
};

export default Checkbox;
