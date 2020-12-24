import React, { ButtonHTMLAttributes } from 'react';
import cx from 'classnames';

export interface AvatarProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  bgImage?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | unknown;
}

export const Avatar: React.FC<AvatarProps> = ({
  children,
  className,
  bgImage,
  onClick,
}: AvatarProps) => (
  <button
    type="button"
    className={cx({
      'relative transform transition-transform z-0 hover:z-10 hover:scale-105 flex items-center justify-center bg-transparent bg-cover bg-no-repeat text-black border-2 border-gray-700 w-10 h-10 rounded-full overflow-hidden focus:outline-none': true,
      [className]: !!className,
    })}
    style={{
      backgroundImage: `url(${bgImage})`,
    }}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Avatar;
