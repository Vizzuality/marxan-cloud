import React, { ReactElement } from 'react';

import cx from 'classnames';

import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import INFO_SVG from 'svgs/ui/info.svg?sprite';

const THEME = {
  primary: {
    button: 'bg-blue-400',
    icon: 'text-gray-800',
  },
  secondary: {
    button: 'bg-black',
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
  theme?: 'primary' | 'secondary'
  size?: 's' | 'base' | 'lg';
}

export const InfoButton: React.FC<InfoButtonProps> = ({
  children,
  size = 'base',
  theme = 'primary',
}: InfoButtonProps) => (
  <Tooltip
    arrow
    placement="right-start"
    trigger="click"
    maxWidth={350}
    interactive
    content={(
      <div
        className="p-4 text-gray-500 bg-white rounded"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {children || 'Add your tooltip info'}
      </div>
    )}
  >
    <button
      className={cx({
        'flex flex-shrink-0 items-center justify-center transition rounded-full bg-opacity-50 focus:outline-none hover:bg-opacity-75 focus:bg-opacity-90': true,
        [THEME[theme].button]: true,
        [SIZE.button[size]]: true,
      })}
      type="button"
    >
      <Icon
        icon={INFO_SVG}
        className={cx({
          [THEME[theme].icon]: true,
          [SIZE.icon[size]]: true,
        })}
      />
    </button>
  </Tooltip>
);

export default InfoButton;
