import React from 'react';
import cx from 'classnames';

const THEME = {
  primary: {
    base: 'leading-tight text-white bg-gray-800 rounded appearance-none focus:outline-none focus:bg-gray-700',
    states: {
      none: 'border border-gray-900',
      valid: 'border border-green-500',
      error: 'border border-red-500',
      disabled: 'opacity-50',
    },
  },
};

const SIZE = {
  base: 'block w-full px-4 py-2',
};

export interface InputProps {
  theme?: 'primary';
  size?: 'base';
  className?: string;
  disabled?: boolean;
  valid?: boolean;
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({
  theme = 'primary',
  size = 'base',
  disabled = false,
  valid = false,
  error = false,
  className,
  ...props
}: InputProps) => {
  return (
    <input
      {...props}
      disabled={disabled}
      className={cx({
        [SIZE[size]]: true,
        [THEME[theme].base]: true,
        [THEME[theme].states.none]: !valid && !error,
        [THEME[theme].states.valid]: valid,
        [THEME[theme].states.error]: error,
        [THEME[theme].states.disabled]: disabled,
        [className]: !!className,
      })}
    />
  );
};

export default Input;
