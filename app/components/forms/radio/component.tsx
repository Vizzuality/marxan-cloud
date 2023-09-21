import React, { InputHTMLAttributes } from 'react';

import cx from 'classnames';

const THEME = {
  dark: {
    base: 'bg-gray-900 border rounded-full text-primary-500 focus:border-primary-500 focus:outline-none',
    status: {
      none: 'border-gray-900',
      valid: 'border-gray-900',
      error: 'border-red-600',
      disabled: 'border-gray-900 opacity-50',
    },
  },
  light: {
    base: 'bg-white border rounded-full text-primary-500 focus:border-primary-500 focus:outline-none',
    status: {
      none: 'border-gray-900',
      valid: 'border-gray-900',
      error: 'border-red-600 focus:border-red-600',
      disabled: 'border-gray-900 opacity-50',
    },
  },
};

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'dark' | 'light';
  status?: 'none' | 'valid' | 'error' | 'disabled';
}

export const Radio: React.FC<RadioProps> = ({
  theme = 'dark',
  status = 'none',
  disabled = false,
  className,
  ...props
}: RadioProps) => {
  const st = disabled ? 'disabled' : status;

  return (
    <input
      {...props}
      type="radio"
      disabled={disabled}
      className={cx({
        'form-radio': true,
        [THEME[theme].base]: true,
        [THEME[theme].status[st]]: true,
        [className]: !!className,
      })}
    />
  );
};

export default Radio;
