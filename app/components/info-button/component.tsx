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

export interface InfoButtonProps {
  children: ReactElement;
  theme?: 'primary' | 'secondary'
}

export const InfoButton: React.FC<InfoButtonProps> = ({
  children,
  theme = 'primary',
}: InfoButtonProps) => (
  <Tooltip
    arrow
    placement="right-start"
    trigger="click"
    maxWidth={350}
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
        'flex items-center justify-center w-5 h-5 transition rounded-full bg-opacity-50 focus:outline-none hover:bg-opacity-75 focus:bg-opacity-90': true,
        [THEME[theme].button]: true,
      })}
      type="button"
    >
      <Icon
        icon={INFO_SVG}
        className={cx({
          'w-3 h-3': true,
          [THEME[theme].icon]: true,
        })}
      />
    </button>
  </Tooltip>
);

export default InfoButton;
