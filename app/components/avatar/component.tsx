import React from 'react';
import cx from 'classnames';

export interface AvatarProps {
  children: React.ReactNode;
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
      'flex items-center justify-center bg-transparent bg-cover text-black w-10 h-10 rounded-full overflow-hidden focus:outline-none': true,
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
