import React, { useState, useCallback, useMemo } from 'react';
import cx from 'classnames';

import Joyride from 'react-joyride';
import Icon from 'components/icon';

import { motion } from 'framer-motion';

import HELP_SVG from 'svgs/ui/help.svg?sprite';

import { useRouter } from 'next/router';

import HelpTooltip from './tooltip';
import GUIDES from './guides';

export const Help = () => {
  const [run, setRun] = useState(false);
  const { pathname } = useRouter();
  const { STEPS } = useMemo(() => {
    return GUIDES[pathname];
  }, [pathname]);

  const onToggleRun = useCallback((e) => {
    e.preventDefault();
    setRun(!run);
  }, [run]);

  return (
    <div>
      <Joyride
        continuous
        scrollToFirstStep
        run={run}
        steps={STEPS}
        styles={{
          options: {
            overlayColor: 'rgba(0,0,0,0.85)',
          },
        }}
        floaterProps={{
          styles: {
            arrow: {
              color: '#fff',
              display: 'inline-flex',
              length: 8,
              margin: 16,
              position: 'absolute',
              spread: 16,
            },
            floaterWithAnimation: {
              transition: 'opacity 0.3s',
            },
          },
        }}
        callback={(state) => {
          const { action } = state;

          if (action === 'reset') {
            setRun(false);
          }
        }}
        tooltipComponent={HelpTooltip}
      />

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
            onClick={onToggleRun}
          >
            <div
              className={cx({
                'absolute z-10 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-4xl transition-colors w-full h-full': true,
                'bg-gray-500': !run,
                'bg-primary-500': run,
              })}
            />
            <motion.div
              className="absolute z-0 transform -translate-x-1/2 -translate-y-1/2 bg-black border border-white border-opacity-25 top-1/2 left-1/2 rounded-4xl"
              style={{
                width: 'calc(100% + 7px)',
                height: 'calc(100% + 7px)',
              }}
              animate={run ? 'enter' : 'exit'}
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
                animate={run ? 'enter' : 'exit'}
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

export default Help;
