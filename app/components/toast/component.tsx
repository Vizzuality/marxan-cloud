import React, { useCallback, useEffect, useRef } from 'react';

import cx from 'classnames';

import { motion, useAnimation } from 'framer-motion';
import type { ResolvedValues } from 'framer-motion';

import Icon from 'components/icon';

import ERROR_SVG from 'svgs/notifications/error.svg?sprite';
import INFO_SVG from 'svgs/notifications/info.svg?sprite';
import SUCCESS_SVG from 'svgs/notifications/success.svg?sprite';
import WARNING_SVG from 'svgs/notifications/warning.svg?sprite';
import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import { ToastProps, ToastTheme } from './types';

const THEME: ToastTheme = {
  info: {
    icon: INFO_SVG,
    bg: 'from-blue-400 to-blue-700',
    hoverBg: 'from-blue-100 to-blue-400',
  },
  success: {
    icon: SUCCESS_SVG,
    bg: 'from-green-500 to-green-800',
    hoverBg: 'from-green-200 to-green-500',
  },
  warning: {
    icon: WARNING_SVG,
    bg: 'from-yellow-500 to-yellow-800',
    hoverBg: 'from-yellow-200 to-yellow-500',
  },
  error: {
    icon: ERROR_SVG,
    bg: 'from-red-1000 to-red-800',
    hoverBg: 'from-red-200 to-red-1000',
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  content,
  level,
  autoDismiss = true,
  onDismiss,
}: ToastProps) => {
  const DURATION = 5;
  const controls = useAnimation();
  const progress = useRef(0);

  useEffect(() => {
    if (autoDismiss) {
      controls.start({
        y: '100%',
        transition: { duration: DURATION },
      });
    }
  }, [controls, autoDismiss]);

  const handleProgressUpdate = useCallback(
    ({ y }: ResolvedValues) => {
      const y2 = parseInt(y as string, 10);
      progress.current = y2 / 100;
    },
    [progress]
  );

  const handleDismiss = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{
        ease: 'anticipate',
        duration: 0.5,
      }}
    >
      <div
        className={cx({
          'pointer-events-auto mb-2 w-full': true,
        })}
      >
        <div
          className="flex w-full rounded-2xl bg-white p-2 text-gray-600 shadow-md transition hover:ring-4 hover:ring-white hover:ring-opacity-40"
          onMouseEnter={() => {
            controls.stop();
          }}
          onMouseLeave={() => {
            controls.start({
              y: '100%',
              transition: { duration: DURATION - DURATION * progress.current },
            });
          }}
        >
          <div className="flex flex-grow">
            <div
              className={cx({
                'relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-md':
                  true,
              })}
            >
              <div
                className={cx({
                  'absolute left-0 top-0 z-0 h-full w-full bg-gradient-to-b': true,
                  [THEME[level]?.hoverBg]: true,
                })}
              />
              <motion.div
                className={cx({
                  'absolute left-0 top-0 z-10 h-full w-full bg-gradient-to-b': true,
                  [THEME[level]?.bg]: true,
                })}
                initial={{ y: '0%' }}
                animate={controls}
                onUpdate={handleProgressUpdate}
                onAnimationComplete={handleDismiss}
              />

              <Icon icon={THEME[level]?.icon} className="relative z-20 h-5 w-5 self-center" />
            </div>

            <div className="ml-2.5 flex-grow">{content}</div>
          </div>

          <button
            aria-label="close"
            type="button"
            className="ml-5 flex h-10 w-10 flex-shrink-0 items-center justify-center"
            onClick={handleDismiss}
          >
            <Icon icon={CLOSE_SVG} className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Toast;
