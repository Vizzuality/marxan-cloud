import React, { ButtonHTMLAttributes } from 'react';

import chroma from 'chroma-js';
import cx from 'classnames';

const SIZE = {
  s: 'h-8 w-8',
  base: 'h-10 w-10',
  lg: 'h-11 w-14',
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
        'relative z-0 hover:z-10 flex items-center justify-center bg-transparent bg-cover bg-no-repeat bg-center border-2 border-gray-700 rounded-full focus:outline-none': true,
        'text-white': contrast > 2.5,
        'text-black': contrast < 2.5,
        [SIZE[size]]: true,
        [className]: !!className,
      })}
      style={{
        ...bgImage && { backgroundImage: `url(${bgImage})` },
        ...bgColor && { backgroundColor: bgColor },
      }}
    >
      {children}
    </div>
  );
};

export default Avatar;
