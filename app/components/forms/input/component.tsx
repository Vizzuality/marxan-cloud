import React, { InputHTMLAttributes } from 'react';
import Icon from 'components/icon';
import cx from 'classnames';

const THEME = {
  dark: {
    base:
      'w-full leading-tight text-white bg-gray-800 bg-opacity-0 focus:outline-none focus:bg-gray-700',
    status: {
      none: 'border-gray-500',
      valid: 'border-green-500',
      error: 'border-red-500',
      disabled: 'border-gray-500 opacity-50',
    },
    icon: 'text-white',
    mode: {
      normal: 'border rounded',
      dashed: 'border-dashed border-b',
    },
  },
  light: {
    base:
      'w-full leading-tight text-gray-800 bg-white border rounded focus:outline-none focus:bg-gray-100',
    status: {
      none: 'border-gray-800',
      valid: 'border-green-500',
      error: 'border-red-500',
      disabled: 'border-gray-800 opacity-50',
    },
    icon: 'text-gray-800 text-opacity-50',
    mode: {
      normal: 'border rounded',
      dashed: 'border-dashed border-b',
    },
  },
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'dark' | 'light';
  status?: 'none' | 'valid' | 'error' | 'disabled';
  mode?: 'dashed' | 'normal';
  icon?: {
    id: string;
    viewBox: string;
  };
}

export const Input: React.FC<InputProps> = ({
  theme = 'dark',
  status = 'none',
  mode = 'normal',
  disabled = false,
  icon,
  className,
  ...props
}: InputProps) => {
  const st = disabled ? 'disabled' : status;

  return (
    <div className="relative">
      {icon && (
        <Icon
          icon={icon}
          className={cx({
            'absolute w-4 h-4 transform -translate-y-1/2 top-1/2 left-3': true,
            [THEME[theme].icon]: true,
          })}
        />
      )}

      <input
        {...props}
        disabled={disabled}
        className={cx({
          'form-input': true,
          [THEME[theme].base]: true,
          [THEME[theme].status[st]]: true,
          [THEME[theme].mode[mode]]: true,
          'pl-10': icon,
          [className]: !!className,
        })}
      />
    </div>
  );
};

export default Input;
