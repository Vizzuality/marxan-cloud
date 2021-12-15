import React, { ButtonHTMLAttributes } from 'react';

import cx from 'classnames';

const SIZE = {
  s: 'h-8 w-8',
  base: 'h-10 w-10',
  lg: 'h-11 w-11',
};

export interface AvatarProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  bgImage?: string;
  size?: 's' | 'base' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({
  children,
  className,
  bgImage,
  size = 'base',
}: AvatarProps) => (
  <div
    className={cx({
      'relative z-0 hover:z-10 flex items-center justify-center bg-transparent bg-cover bg-no-repeat bg-center border-2 border-gray-700 rounded-full focus:outline-none': true,
      [SIZE[size]]: true,
      [className]: !!className,
    })}
    style={{
      ...bgImage && { backgroundImage: `url(${bgImage})` },
    }}
  >
    {children}
  </div>
);

export default Avatar;
