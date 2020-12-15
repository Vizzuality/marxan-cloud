import React, { InputHTMLAttributes } from 'react';
import cx from 'classnames';

const THEME = {
  primary: {
    base:
      'bg-gray-800 border rounded-full text-primary-500 focus:border-primary-500 focus:outline-none',
    states: {
      none: 'border-gray-900',
      valid: 'border-gray-900',
      error: 'border-red-500',
      disabled: 'border-gray-900 opacity-50',
    },
  },
};

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'primary';
  state?: 'none' | 'valid' | 'error' | 'disabled';
}

export const Radio: React.FC<RadioProps> = ({
  theme = 'primary',
  state = 'none',
  disabled = false,
  className,
  ...props
}: RadioProps) => {
  const st = disabled ? 'disabled' : state;

  return (
    <input
      {...props}
      type="radio"
      disabled={disabled}
      className={cx({
        'form-radio': true,
        [THEME[theme].base]: true,
        [THEME[theme].states[st]]: true,
        [className]: !!className,
      })}
    />
  );
};

export default Radio;
