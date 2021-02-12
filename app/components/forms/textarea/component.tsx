import React, { TextareaHTMLAttributes } from 'react';
import cx from 'classnames';

const THEME = {
  dark: {
    base:
      'leading-tight text-white bg-gray-800 border rounded focus:outline-none focus:bg-gray-700',
    status: {
      none: 'border-gray-800',
      valid: 'border-green-500',
      error: 'border-red-500',
      disabled: 'border-gray-800 opacity-50',
    },
  },
  light: {
    base:
      'leading-tight text-gray-800 bg-white border rounded focus:outline-none focus:bg-gray-100',
    status: {
      none: 'border-gray-800',
      valid: 'border-green-500',
      error: 'border-red-500',
      disabled: 'border-gray-800 opacity-50',
    },
  },
};

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  theme?: 'dark' | 'light';
  status?: 'none' | 'valid' | 'error' | 'disabled';
}

export const Textarea: React.FC<TextareaProps> = ({
  theme = 'dark',
  status = 'none',
  disabled = false,
  className,
  ...props
}: TextareaProps) => {
  const st = disabled ? 'disabled' : status;

  return (
    <textarea
      {...props}
      disabled={disabled}
      className={cx({
        'form-textarea w-full': true,
        [THEME[theme].base]: true,
        [THEME[theme].status[st]]: true,
        [className]: !!className,
      })}
    />
  );
};

export default Textarea;
