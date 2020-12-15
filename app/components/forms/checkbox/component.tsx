import React, { InputHTMLAttributes } from 'react';
import cx from 'classnames';

const THEME = {
  primary: {
    base:
      'leading-tight bg-gray-800 border rounded focus:border-transparent focus:outline-none',
    states: {
      none: 'border-gray-900',
      valid: 'border-green-500',
      error: 'border-red-500',
      disabled: 'border-gray-900 opacity-50',
    },
  },
};

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'primary';
  state?: 'none' | 'valid' | 'error' | 'disabled';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  theme = 'primary',
  state = 'none',
  disabled = false,
  className,
  ...props
}: CheckboxProps) => {
  const st = disabled ? 'disabled' : state;

  return (
    <input
      {...props}
      type="checkbox"
      disabled={disabled}
      className={cx({
        'form-checkbox': true,
        [THEME[theme].base]: true,
        [THEME[theme].states[st]]: true,
        [className]: !!className,
      })}
    />
  );
};

export default Checkbox;
