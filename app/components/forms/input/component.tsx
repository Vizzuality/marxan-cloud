import React, { InputHTMLAttributes } from 'react';
import cx from 'classnames';

const THEME = {
  primary: {
    base:
      'w-full leading-tight text-white bg-gray-800 border rounded focus:outline-none focus:bg-gray-700',
    status: {
      none: 'border-gray-900',
      valid: 'border-green-500',
      error: 'border-red-500',
      disabled: 'border-gray-900 opacity-50',
    },
  },
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'primary';
  status?: 'none' | 'valid' | 'error' | 'disabled';
}

export const Input: React.FC<InputProps> = ({
  theme = 'primary',
  status = 'none',
  disabled = false,
  className,
  ...props
}: InputProps) => {
  const st = disabled ? 'disabled' : status;

  return (
    <input
      {...props}
      disabled={disabled}
      className={cx({
        'form-input': true,
        [THEME[theme].base]: true,
        [THEME[theme].status[st]]: true,
        [className]: !!className,
      })}
    />
  );
};

export default Input;
