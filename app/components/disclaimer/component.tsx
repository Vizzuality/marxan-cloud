import React from 'react';

import cx from 'classnames';

import Icon from 'components/icon';

import WARNING_SVG from 'svgs/notifications/warning.svg?sprite';

const TYPE = {
  warning: 'text-yellow-500',
  blocked: 'text-red-600',
  invalidated: 'text-white',
};

export interface DisclaimerProps {
  children: React.ReactNode;
  type: 'warning' | 'blocked' | 'invalidated';
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ children, type }: DisclaimerProps) => (
  <div
    className={cx({
      'flex w-full items-center space-x-4 rounded-xl bg-gray-600 px-4 py-3 text-sm': true,
    })}
  >
    <Icon
      icon={WARNING_SVG}
      className={cx({
        'z-10 h-6 w-6': true,
        [TYPE[type]]: true,
      })}
    />
    <div className="text-white">{children}</div>
  </div>
);

export default Disclaimer;
