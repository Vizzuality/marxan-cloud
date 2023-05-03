import React, { useCallback } from 'react';

import cx from 'classnames';

import { motion } from 'framer-motion';
import { usePlausible } from 'next-plausible';

import { useHelp } from 'hooks/help';
import { useMe } from 'hooks/me';

import Icon from 'components/icon';

import HELP_SVG from 'svgs/ui/help.svg?sprite';

export const HelpButton = () => {
  const { active, onActive } = useHelp();
  const plausible = usePlausible();
  const { user } = useMe();

  const onToggleActive = useCallback(
    (e) => {
      e.preventDefault();
      onActive(!active);
      if (active) {
        plausible('Activate help guide', {
          props: {
            userId: `${user.id}`,
            userEmail: `${user.email}`,
          },
        });
      }
    },
    [active, onActive, plausible, user.id, user.email]
  );

  return (
    <div>
      <div className="fixed bottom-0 right-0 z-50 p-2">
        <div className="flex flex-col items-center justify-center space-y-2">
          <button
            type="button"
            className={cx({
              'relative h-14 w-8 rounded-4xl p-1 focus:outline-none': true,
            })}
            style={{
              boxShadow: '2px 1px 3px 0px rgba(0,0,0,0.5) inset',
            }}
            onClick={onToggleActive}
          >
            <div
              className={cx({
                'absolute left-1/2 top-1/2 z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 transform rounded-4xl transition-colors':
                  true,
                'bg-gray-500': !active,
                'bg-primary-500': active,
              })}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 transform rounded-4xl border border-white border-opacity-25 bg-black"
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
            <div className="relative z-20 h-full w-full">
              <motion.span
                className="absolute left-1/2 flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow"
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
                <Icon icon={HELP_SVG} className="h-4 w-4" />
              </motion.span>
            </div>
          </button>
          <span className="block w-10 text-center text-xxs leading-tight text-white">
            Activate guide
          </span>
        </div>
      </div>
    </div>
  );
};

export default HelpButton;
