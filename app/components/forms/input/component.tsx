import React, { InputHTMLAttributes } from 'react';
import cx from 'classnames';

const THEME = {
  primary: {
    base:
      'leading-tight text-white bg-gray-800 border rounded appearance-none focus:outline-none focus:bg-gray-700',
    states: {
      none: 'border-gray-900',
      valid: 'border-green-500',
      error: 'border-red-500',
      disabled: 'border-gray-900 opacity-50',
    },
  },
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'primary';
  state?: 'none' | 'valid' | 'error' | 'disabled';
}

const Input: React.FC<InputProps> = ({
  theme = 'primary',
  state = 'none',
  disabled = false,
  className,
  ...props
}: InputProps) => {
  const st = disabled ? 'disabled' : state;

  return (
    <input
      {...props}
      disabled={disabled}
      className={cx({
        'block w-full px-4 py-2': true,
        [THEME[theme].base]: true,
        [THEME[theme].states[st]]: true,
        [className]: !!className,
      })}
    />
  );
};

export default Input;
