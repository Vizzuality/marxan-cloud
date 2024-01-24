import React from 'react';

import { cn } from 'utils/cn';

export interface IconProps {
  icon: {
    id: string;
    viewBox: string;
  };
  className?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({ icon, className = 'w-5 h-5', style }: IconProps) => {
  return (
    <svg
      className={cn({
        'fill-current transition-colors': true,
        [className]: className,
      })}
      viewBox={icon?.viewBox || '0 0 32 32'}
      style={style}
    >
      <use xlinkHref={`#${icon?.id || icon}`} />
    </svg>
  );
};

export default Icon;
