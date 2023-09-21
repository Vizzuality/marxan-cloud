import React, { TextareaHTMLAttributes } from 'react';

import cx from 'classnames';

const THEME = {
  dark: {
    base: 'leading-tight text-white bg-transparent border rounded focus:outline-none',
    status: {
      none: 'border-gray-600',
      valid: 'border-gray-600',
      error: 'border-red-600',
      disabled: 'border-gray-900 opacity-50',
    },
  },
  light: {
    base: 'leading-tight text-gray-900 bg-transparent border rounded focus:outline-none',
    status: {
      none: 'border-gray-600',
      valid: 'border-gray-600',
      error: 'border-red-600',
      disabled: 'border-gray-900 opacity-50',
    },
  },
};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
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
