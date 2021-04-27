import React, { InputHTMLAttributes } from 'react';
import cx from 'classnames';

const THEME = {
  dark: {
    base:
      'bg-black border rounded-sm text-primary-500 focus:border-primary-500 focus:outline-none',
    status: {
      none: 'border-gray-500',
      valid: 'border-gray-500',
      error: 'border-red-500 focus:border-red-500',
      disabled: 'border-gray-500 opacity-50',
    },
  },
  light: {
    base:
      'bg-white border rounded-sm text-primary-500 focus:border-primary-500 focus:outline-none',
    status: {
      none: 'border-gray-800',
      valid: 'border-gray-800',
      error: 'border-red-500 focus:border-red-500',
      disabled: 'border-gray-800 opacity-50',
    },
  },
};

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'dark' | 'light';
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
      className={cx({
        'form-checkbox': true,
        [THEME[theme].base]: true,
        [THEME[theme].status[st]]: true,
        [className]: !!className,
      })}
    />
  );
};

export default Checkbox;
