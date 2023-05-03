import React, { ButtonHTMLAttributes } from 'react';

import cx from 'classnames';

import chroma from 'chroma-js';

const SIZE = {
  s: 'h-8 w-8',
  base: 'h-10 w-10',
  lg: 'h-14 w-14',
};

export interface AvatarProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  bgImage?: string;
  bgColor?: string;
  size?: 's' | 'base' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({
  children,
  className,
  bgImage,
  bgColor,
  size = 'base',
}: AvatarProps) => {
  const contrast = chroma.contrast(bgColor || 'white', 'white');

  return (
    <div
      className={cx({
        'relative z-0 flex items-center justify-center rounded-full border-2 border-gray-700 bg-transparent bg-cover bg-center bg-no-repeat hover:z-10 focus:outline-none':
          true,
        'text-white': contrast > 2.5,
        'text-black': contrast < 2.5,
        [SIZE[size]]: true,
        [className]: !!className,
      })}
      style={{
        ...(bgImage && { backgroundImage: `url(${bgImage})` }),
        ...(bgColor && { backgroundColor: bgColor }),
      }}
    >
      {children}
    </div>
  );
};

export default Avatar;
