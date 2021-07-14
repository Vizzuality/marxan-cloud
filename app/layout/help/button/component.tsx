import React, { useCallback } from 'react';
import cx from 'classnames';

import Icon from 'components/icon';

import { motion } from 'framer-motion';

import { useHelp } from 'hooks/help';

import HELP_SVG from 'svgs/ui/help.svg?sprite';

export const HelpButton = () => {
  const { active, onActive } = useHelp();

  const onToggleActive = useCallback((e) => {
    e.preventDefault();
    onActive(!active);
  }, [active, onActive]);

  return (
    <div>
      <div
        className="fixed bottom-0 right-0 z-50 p-2"
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <button
            type="button"
            className={cx({
              'relative w-8 focus:outline-none h-14 rounded-4xl p-1': true,
            })}
            style={{
              boxShadow: '2px 1px 3px 0px rgba(0,0,0,0.5) inset',
            }}
            onClick={onToggleActive}
          >
            <div
              className={cx({
                'absolute z-10 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-4xl transition-colors w-full h-full': true,
                'bg-gray-500': !active,
                'bg-primary-500': active,
              })}
            />
            <motion.div
              className="absolute z-0 transform -translate-x-1/2 -translate-y-1/2 bg-black border border-white border-opacity-25 top-1/2 left-1/2 rounded-4xl"
              style={{
                width: 'calc(100% + 7px)',
                height: 'calc(100% + 7px)',
              }}
              animate={active ? 'enter' : 'exit'}
              transition={{
                duration: 0.2,
              }}
              initial={{
                opacity: '0%',
              }}
              variants={{
                enter: {
                  opacity: '100%',
                },
                exit: {
                  opacity: '0%',
                },
              }}
            />
            <div className="relative z-20 w-full h-full">
              <motion.span
                className="absolute flex items-center justify-center w-6 h-6 transform bg-white rounded-full shadow left-1/2"
                animate={active ? 'enter' : 'exit'}
                transition={{
                  duration: 0.2,
                }}
                initial={{
                  bottom: '0%',
                  y: '0%',
                  x: '-50%',
                }}
                variants={{
                  enter: {
                    bottom: '100%',
                    y: '100%',
                    x: '-50%',
                  },
                  exit: {
                    bottom: '0%',
                    y: '0%',
                    x: '-50%',
                  },
                }}
              >
                <Icon icon={HELP_SVG} className="w-4 h-4" />
              </motion.span>
            </div>
          </button>
          <span className="block w-10 leading-tight text-center text-white text-xxs">Activate guide</span>
        </div>
      </div>
    </div>
  );
};

export default HelpButton;
