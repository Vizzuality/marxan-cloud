import React, { InputHTMLAttributes } from 'react';

import { useFocus } from '@react-aria/interactions';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

const THEME = {
  dark: {
    base: 'w-full leading-tight text-white bg-gray-900 bg-opacity-0 focus:outline-none focus:bg-gray-800',
    status: {
      none: 'border-gray-700',
      valid: 'border-gray-700',
      error: 'border-red-600',
      disabled: 'border-gray-600 opacity-50',
    },
    icon: 'text-white',
    mode: {
      normal: 'border rounded',
      dashed: 'border-dashed border-b',
    },
  },
  light: {
    base: 'w-full leading-tight text-gray-900 bg-white focus:outline-none focus:bg-gray-200',
    status: {
      none: 'border-gray-900',
      valid: 'border-gray-900',
      error: 'border-red-600',
      disabled: 'border-gray-900 opacity-50',
    },
    icon: 'text-gray-900 text-opacity-50',
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
  onFocus?: () => void;
  onBlur?: () => void;
  onFocusChange?: (isFocused: boolean) => void;
  onReady?: (ref) => void;
}

export const Input: React.FC<InputProps> = ({
  theme = 'dark',
  status = 'none',
  mode = 'normal',
  disabled = false,
  icon,
  className,
  onFocus,
  onBlur,
  onFocusChange,
  onReady,
  ...props
}: InputProps) => {
  const st = disabled ? 'disabled' : status;

  const { focusProps: inputFocusProps } = useFocus({
    onFocus,
    onBlur,
    onFocusChange,
  });

  return (
    <div className="relative">
      {icon && (
        <Icon
          icon={icon}
          className={cn({
            'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform': true,
            [THEME[theme].icon]: true,
          })}
        />
      )}

      <input
        {...props}
        ref={onReady}
        disabled={disabled}
        className={cn({
          'form-input': true,
          [THEME[theme].base]: true,
          [THEME[theme].status[st]]: true,
          [THEME[theme].mode[mode]]: true,
          'pl-10': icon,
          [className]: !!className,
        })}
        {...inputFocusProps}
      />
    </div>
  );
};

export default Input;
