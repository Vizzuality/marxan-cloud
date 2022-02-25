import React from 'react';

import cx from 'classnames';

import Icon from 'components/icon';

import WARNING_SVG from 'svgs/notifications/warning.svg?sprite';

const TYPE = {
  warning: 'text-yellow-400',
  blocked: 'text-red-500',
  invalidated: 'text-white',
};

export interface DisclaimerProps {
  children: React.ReactNode;
  type: 'warning' | 'blocked' | 'invalidated';
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ children, type }: DisclaimerProps) => (
  <div
    className={cx({
      'rounded-xl w-full bg-gray-500 flex text-sm px-4 py-3 space-x-4 items-center': true,
    })}
  >
    <Icon
      icon={WARNING_SVG}
      className={cx({
        'z-10 w-6 h-6': true,
        [TYPE[type]]: true,
      })}
    />
    <div className="text-white">{children}</div>
  </div>
);

export default Disclaimer;
