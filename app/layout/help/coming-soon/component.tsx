import React, { ReactChild } from 'react';

import Tooltip from 'components/tooltip';
import { cn } from 'utils/cn';

const THEME = {
  dark: {
    base: 'px-4 py-1.5 text-xs text-white bg-gray-600 rounded',
    arrow: 'bg-gray-600',
  },
  light: {
    base: 'px-4 py-1.5 text-xs text-gray-600 bg-white rounded',
    arrow: 'bg-white',
  },
};
export interface ComingSoonProps {
  children: ReactChild;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  theme?: 'dark' | 'light';
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  children,
  placement = 'bottom',
  theme = 'light',
}: ComingSoonProps) => {
  return (
    <Tooltip
      arrow
      arrowClassName={cn({
        [THEME[theme].arrow]: true,
      })}
      placement={placement}
      maxWidth={350}
      content={
        <div
          className={cn({
            [THEME[theme].base]: true,
          })}
        >
          <span>Feature coming soon!</span>
        </div>
      }
    >
      <div className="opacity-30">
        <div className="pointer-events-none">{children}</div>
      </div>
    </Tooltip>
  );
};

export default ComingSoon;
