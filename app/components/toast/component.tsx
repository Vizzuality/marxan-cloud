import React, { useCallback } from 'react';
import cx from 'classnames';
import { ToastItemProps } from 'hooks/toast/types';

import SUCCESS_SVG from 'svgs/notifications/success.svg?sprite';
import ERROR_SVG from 'svgs/notifications/error.svg?sprite';
import WARNING_SVG from 'svgs/notifications/warning.svg?sprite';
import INFO_SVG from 'svgs/notifications/info.svg?sprite';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import Icon from 'components/icon';

import { motion } from 'framer-motion';

export interface ToastProps extends ToastItemProps {
}

const THEME = {
  info: {
    icon: INFO_SVG,
    bg: 'bg-blue-500',
    hoverBg: 'bg-blue-300',
  },
  success: {
    icon: SUCCESS_SVG,
    bg: 'bg-green-500',
    hoverBg: 'bg-green-300',
  },
  warning: {
    icon: WARNING_SVG,
    bg: 'bg-yellow-500',
    hoverBg: 'bg-yellow-300',
  },
  error: {
    icon: ERROR_SVG,
    bg: 'bg-red-500',
    hoverBg: 'bg-red-300',
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  content,
  level,
  onDismiss,
}: ToastProps) => {
  const handleDismiss = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
    >
      <div
        className={cx({
          'w-full pointer-events-auto': true,
        })}
      >
        <div className="flex w-full p-2 text-gray-500 bg-white rounded-2xl">
          <div className="flex flex-grow">
            <div className={cx({
              'relative w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden': true,
            })}
            >
              <div
                className={cx({
                  'absolute top-0 left-0 z-0 w-full h-full': true,
                  [THEME[level]?.hoverBg]: true,
                })}
              />
              <motion.div
                className={cx({
                  'absolute top-0 left-0 z-10 w-full h-full': true,
                  [THEME[level]?.bg]: true,
                })}
                initial={{ y: '0%' }}
                animate={{ y: '100%' }}
                transition={{ duration: 5 }}
                onAnimationComplete={handleDismiss}
              />

              <Icon icon={THEME[level]?.icon} className="relative z-20 self-center w-5 h-5" />
            </div>

            <div className="flex-grow ml-2.5">
              {content}
            </div>
          </div>

          <button
            type="button"
            className="flex items-center justify-center flex-shrink-0 w-10 h-10 ml-5"
            onClick={handleDismiss}
          >
            <Icon icon={CLOSE_SVG} className="w-3 h-3" />
          </button>
        </div>
        <div className="w-full h-2" />
      </div>
    </motion.div>
  );
};

export default Toast;
