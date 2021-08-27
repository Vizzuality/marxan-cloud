import React, { ButtonHTMLAttributes } from 'react';

import cx from 'classnames';

const SIZE = {
  s: 'w-8 h-8',
  base: 'w-10 h-10',
};

export interface AvatarProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  bgImage?: string;
  size?: 's' | 'base';
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
