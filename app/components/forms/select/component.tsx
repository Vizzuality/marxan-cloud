import React, { SelectHTMLAttributes, OptionHTMLAttributes } from 'react';
import cx from 'classnames';

const THEME = {
  primary: {
    base:
      'w-full leading-tight text-white bg-gray-800 border rounded-4xl focus:outline-none focus:bg-gray-700',
    states: {
      none: 'border-white border-opacity-50',
      valid: 'border-green-500',
      error: 'border-red-500',
      disabled: 'border-white border-opacity-50 opacity-25',
    },
  },
};

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  theme?: 'primary';
  state?: 'none' | 'valid' | 'error' | 'disabled';
  options?: Record<string, unknown>[];
}

export interface OptionProps extends OptionHTMLAttributes<HTMLOptionElement> {}

const Option: React.FC<OptionProps> = ({
  label,
  value,
  ...rest
}: OptionProps) => {
  return (
    <option {...rest} value={value}>
      {label}
    </option>
  );
};

export const Select: React.FC<SelectProps> = ({
  theme = 'primary',
  state = 'none',
  disabled = false,
  placeholder = '',
  value,
  options = [],
  className,
  ...props
}: SelectProps) => {
  const st = disabled ? 'disabled' : state;

  return (
    <select
      {...props}
      disabled={disabled}
      className={cx({
        'form-select': true,
        [THEME[theme].base]: true,
        [THEME[theme].states[st]]: true,
        [className]: !!className,
      })}
    >
      {placeholder && <Option disabled selected={!value} label={placeholder} />}

      {options.map(({ value: v, ...o }) => (
        <Option key={`${v}`} value={`${v}`} {...o} />
      ))}
    </select>
  );
};

export default Select;
