import React, {
  ReactNode,
  ReactElement,
  cloneElement,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import { useResizeDetector } from 'react-resize-detector';

import cx from 'classnames';

import { useRouter } from 'next/router';

import type { Placement } from '@popperjs/core';
import { AnimatePresence, motion } from 'framer-motion';

import { useHelp } from 'hooks/help';

import Tooltip from 'components/tooltip';
import HelpSpotlight from 'layout/help/spotlight';
import HelpTooltip from 'layout/help/tooltip';

const flipModifier = {
  name: 'flip',
  enabled: false,
};

const hideModifier = {
  name: 'hide',
  enabled: true,
};

const MODIFIERS = [flipModifier, hideModifier];
export interface HelpBeaconProps {
  id: string;
  title: string;
  subtitle?: string;
  content: ReactNode;
  children: ReactElement;
  placement?: Placement;
  modifiers?: string[];
  tooltipPlacement?: Placement;
  beaconClassName?: string;
}

export const HelpBeacon: React.FC<HelpBeaconProps> = ({
  id,
  title,
  subtitle,
  content,
  children,
  placement = 'top-start',
  modifiers = ['flip', 'hide'],
  tooltipPlacement = 'bottom',
  beaconClassName,
}: HelpBeaconProps) => {
  const { active, beacons, addBeacon } = useHelp();
  const [visible, setVisible] = useState(false);
  const { pathname } = useRouter();

  const updateTimeout = useRef(null);
  const updateTime = useRef(5);

  const childrenRef = useRef(null);
  const [beaconRef, setBeaconRef] = useState(null);

  const CHILDREN = cloneElement(children, {
    ref: childrenRef,
  });

  const onResize = useCallback(() => {
    Object.keys(beacons).forEach((k) => {
      const b = beacons[k];
      if (b.update) b.update();
    });
  }, [beacons]);

  const onUpdate = useCallback(() => {
    onResize();

    clearTimeout(updateTimeout.current);

    updateTimeout.current = setTimeout(() => {
      if (active) {
        onUpdate();
        updateTime.current += Math.log10(updateTime.current);
      } else {
        updateTime.current = 5;
        clearTimeout(updateTimeout.current);
      }
    }, updateTime.current);
  }, [active, onResize]);

  // 'usePopper'
  const { styles, attributes, state, update } = usePopper(childrenRef.current, beaconRef, {
    placement,
    modifiers: MODIFIERS.map((m) => {
      return {
        ...m,
        enabled: modifiers.includes(m.name),
      };
    }),
  });

  useResizeDetector({
    targetRef: childrenRef,
    onResize: () => {
      updateTime.current = 5;
      onResize();
    },
  });

  useEffect(() => {
    onUpdate();

    return () => {
      updateTime.current = 5;
      clearTimeout(updateTimeout.current);
    };
  }, [onUpdate]);

  useEffect(() => {
    addBeacon({
      id: `${pathname}-${id}`,
      state,
      update,
    });
  }, [active, pathname, id, state, childrenRef, beaconRef, addBeacon, update]);

  return (
    <>
      <Tooltip
        arrow
        placement={tooltipPlacement}
        visible={visible && active}
        maxWidth={350}
        onClickOutside={() => {
          setVisible(false);
        }}
        content={<HelpTooltip title={title} subtitle={subtitle} content={content} />}
      >
        {CHILDREN}
      </Tooltip>

      {typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {!visible && active && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                ref={(el) => setBeaconRef(el)}
                className={cx({
                  'z-30': !beaconClassName,
                  [beaconClassName]: !!beaconClassName,
                  'pointer-events-auto visible': active,
                  'pointer-events-none invisible':
                    !active ||
                    attributes?.popper?.['data-popper-reference-hidden'] ||
                    attributes?.popper?.['data-popper-escaped'],
                })}
                style={styles.popper}
                {...attributes.popper}
              >
                <button
                  aria-label="manage-visibility"
                  type="button"
                  className={cx({
                    'beacon relative flex h-6 w-6 translate-y-3/4 transform items-center justify-center rounded-full border-2 border-gray-700 bg-primary-500 transition focus:outline-none':
                      true,
                  })}
                  onClick={() => {
                    setVisible(!visible);
                  }}
                >
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 animate-pulse rounded-full border-2 border-primary-500" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document?.body
        )}

      {typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {visible && active && <HelpSpotlight childrenRef={childrenRef} />}
          </AnimatePresence>,
          document?.body
        )}
    </>
  );
};

export default HelpBeacon;
