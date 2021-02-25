import React from 'react';
import cx from 'classnames';
import { ToastItemProps } from 'hooks/toast/types';

import SUCCESS_SVG from 'svgs/notifications/success.svg?sprite';
import ERROR_SVG from 'svgs/notifications/error.svg?sprite';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import Icon from 'components/icon';

export interface ToastProps extends ToastItemProps {

}

const THEME = {
  info: {
    icon: SUCCESS_SVG,
    bg: 'bg-green-500',
  },
  success: {
    icon: SUCCESS_SVG,
    bg: 'bg-green-500',
  },
  warning: {
    icon: SUCCESS_SVG,
    bg: 'bg-green-500',
  },
  error: {
    icon: ERROR_SVG,
    bg: 'bg-green-500',
  },
};

export const Toast: React.FC<ToastProps> = ({ id, content, level }: ToastProps) => {
  return (
    <div
      className={cx({
        'flex items-center bg-white rounded-2xl text-gray-500 p-2 w-full max-w-screen-sm': true,
      })}
    >
      <div className="flex flex-grow">
        <div className={cx({
          'w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md': true,
          [THEME[level]?.bg]: true,
        })}
        >
          <Icon icon={THEME[level]?.icon} className="self-center w-5 h-5" />
        </div>

        <div className="flex-grow ml-2.5">
          {content}
        </div>
      </div>

      <button
        type="button"
        className="flex items-center justify-center flex-shrink-0 w-10 h-10 ml-5"
        onClick={() => { console.info('dismiss!!', id); }}
      >
        <Icon icon={CLOSE_SVG} className="w-3 h-3" />
      </button>
    </div>
  );
};

export default Toast;
