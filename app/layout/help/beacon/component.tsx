import React, {
  ReactNode, ReactElement, useRef, cloneElement, useEffect, useState,
} from 'react';
import { createPortal } from 'react-dom';

import cx from 'classnames';

import { useHelp } from 'hooks/help';
import { usePopper } from 'react-popper';

import Tooltip from 'components/tooltip';
import HelpTooltip from 'layout/help/tooltip';
import HelpSpotlight from 'layout/help/spotlight';

export interface HelpBeaconProps {
  title: string;
  subtitle: string;
  content: ReactNode;
  children: ReactElement;
}

export const HelpBeacon: React.FC<HelpBeaconProps> = ({
  title,
  subtitle,
  content,
  children,
}: HelpBeaconProps) => {
  const { active } = useHelp();
  const [visible, setVisible] = useState(false);
  const childrenRef = useRef(null);
  const [beaconRef, setBeaconRef] = useState(null);

  const CHILDREN = cloneElement(children, {
    ref: childrenRef,
  });

  // 'usePopper'
  const flipModifier = {
    name: 'flip',
    enabled: false,
  };

  const { styles, attributes, update } = usePopper(childrenRef.current, beaconRef, {
    placement: 'top-start',
    modifiers: [
      flipModifier,
    ],
  });

  useEffect(() => {
    if (update) update();
  }, [update]);

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
            'visible pointer-events-auto': active,
            'invisible pointer-events-none': !active,
          })}
          style={styles.popper}
          {...attributes.popper}
        >
          <button
            type="button"
            aria-label={title}
            className={cx({
              'beacon flex z-50 items-center justify-center w-6 h-6 bg-primary-500 border-2 border-gray-700 transition rounded-full focus:outline-none transform translate-x-1/2 translate-y-1/2': true,
            })}
            data-beacon="true"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            <div className="absolute top-0 bottom-0 left-0 right-0 border-2 rounded-full pointer-events-none animate-pulse border-primary-500" />
          </button>
        </div>,
        document.body,
      )}

      {typeof window !== 'undefined' && active && visible && createPortal(
        <HelpSpotlight
          childrenRef={childrenRef}
        />,
        document.body,
      )}
    </>
  );
};

export default HelpBeacon;
