import React, {
  ReactNode, ReactElement, cloneElement, useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

import cx from 'classnames';

import { useHelp } from 'hooks/help';
import { usePopper } from 'react-popper';
import { useResizeDetector } from 'react-resize-detector';

import { AnimatePresence } from 'framer-motion';

import Tooltip from 'components/tooltip';
import HelpTooltip from 'layout/help/tooltip';
import HelpSpotlight from 'layout/help/spotlight';

const flipModifier = {
  name: 'flip',
  enabled: false,
};

const hideModifier = {
  name: 'hide',
  enabled: true,
};
export interface HelpBeaconProps {
  id: string;
  title: string;
  subtitle: string;
  content: ReactNode;
  children: ReactElement;
}

export const HelpBeacon: React.FC<HelpBeaconProps> = ({
  id,
  title,
  subtitle,
  content,
  children,
}: HelpBeaconProps) => {
  const { active, beacons, addBeacon } = useHelp();
  const [visible, setVisible] = useState(false);
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

  // 'usePopper'
  const {
    styles, attributes, state, update,
  } = usePopper(childrenRef.current, beaconRef, {
    placement: 'top-start',
    modifiers: [
      flipModifier,
      hideModifier,
    ],
  });

  useResizeDetector({
    targetRef: childrenRef,
    onResize,
  });

  useEffect(() => {
    addBeacon({
      id,
      state,
      update,
    });
  }, [active, addBeacon, id, state, update, childrenRef, beaconRef]);

  return (
    <>
      <Tooltip
        arrow
        placement="bottom"
        visible={visible && active}
        maxWidth={350}
        onClickOutside={() => {
          setVisible(false);
        }}
        content={(
          <HelpTooltip
            title={title}
            subtitle={subtitle}
            content={content}
          />
        )}
      >
        {CHILDREN}
      </Tooltip>

      {typeof window !== 'undefined' && active && !visible && createPortal(
        <div
          ref={((el) => setBeaconRef(el))}
          className={cx({
            'z-50': true,
            'visible pointer-events-auto': active,
            'invisible pointer-events-none': !active || attributes?.popper?.['data-popper-reference-hidden'] || attributes?.popper?.['data-popper-escaped'],
          })}
          style={styles.popper}
          {...attributes.popper}
        >
          <button
            type="button"
            className={cx({
              'relative beacon flex items-center justify-center w-6 h-6 bg-primary-500 border-2 border-gray-700 transition rounded-full focus:outline-none transform translate-x-1/2 translate-y-1/2': true,
            })}
            onClick={() => {
              setVisible(!visible);
            }}
          >
            <div className="absolute top-0 bottom-0 left-0 right-0 border-2 rounded-full pointer-events-none animate-pulse border-primary-500" />
          </button>
        </div>,
        document?.body,
      )}

      {typeof window !== 'undefined' && active && createPortal(
        <AnimatePresence>
          {visible && (
            <HelpSpotlight
              childrenRef={childrenRef}
            />
          )}
        </AnimatePresence>,
        document?.body,
      )}
    </>
  );
};

export default HelpBeacon;
