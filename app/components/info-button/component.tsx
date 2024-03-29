import React, { ReactElement } from 'react';

import Icon from 'components/icon';
import Tooltip from 'components/tooltip';
import { cn } from 'utils/cn';

import INFO_SVG from 'svgs/ui/info.svg?sprite';

const THEME = {
  primary: {
    button: 'bg-blue-500',
    icon: 'text-gray-900',
  },
  secondary: {
    button: 'bg-black',
    icon: 'text-white',
  },
  tertiary: {
    button: 'bg-gray-600',
    icon: 'text-white',
  },
};

const SIZE = {
  icon: {
    s: 'w-2 h-2',
    base: 'w-3 h-3',
    lg: 'w-4 h-4',
  },
  button: {
    s: 'w-4 h-4',
    base: 'w-5 h-5',
    lg: 'w-6 h-6',
  },
};

export interface InfoButtonProps {
  children: ReactElement;
  className?: string;
  theme?: 'primary' | 'secondary' | 'tertiary';
  size?: 's' | 'base' | 'lg';
}

export const InfoButton: React.FC<InfoButtonProps> = ({
  children,
  className,
  size = 'base',
  theme = 'primary',
}: InfoButtonProps) => (
  <Tooltip
    animation
    arrow
    placement="right-start"
    trigger="click"
    maxWidth={350}
    interactive
    content={
      <div
        className="rounded bg-white p-4 text-gray-700"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {children || 'Add your tooltip info'}
      </div>
    }
  >
    <button
      aria-label="info-button"
      className={cn({
        'flex flex-shrink-0 items-center justify-center rounded-full bg-opacity-50 transition hover:bg-opacity-75 focus:bg-opacity-90 focus:outline-none':
          true,
        [THEME[theme].button]: true,
        [SIZE.button[size]]: true,
        [className]: !!className,
      })}
      type="button"
    >
      <Icon
        icon={INFO_SVG}
        className={cn({
          [THEME[theme].icon]: true,
          [SIZE.icon[size]]: true,
        })}
      />
    </button>
  </Tooltip>
);

export default InfoButton;
