import React, { useRef } from 'react';

import Tippy from '@tippyjs/react/headless';
import { useSpring, motion } from 'framer-motion';
import { SpringOptions } from 'popmotion';

import Arrow from './arrow';
import { TooltipProps } from './types';

export const Tooltip: React.FC<TooltipProps> = ({
  children, content, arrow, maxWidth, ...props
}: TooltipProps) => {
  const tooltipRef = useRef(null);
  const springConfig: SpringOptions = { damping: 15, stiffness: 300 };
  const opacity = useSpring(0, springConfig);
  const scale = useSpring(0.95, springConfig);

  function onMount() {
    scale.set(1);
    opacity.set(1);
  }

  function onHide({ unmount }) {
    const cleanup = scale.onChange((value) => {
      if (value <= 0.95) {
        cleanup();
        unmount();
      }
    });

    scale.set(0.95);
    opacity.set(0);
  }

  return (
    <Tippy
      ref={tooltipRef}
      {...props}
      render={(attrs) => {
        if (typeof attrs['data-reference-hidden'] !== 'undefined') {
          tooltipRef.current._tippy.hide(); // eslint-disable-line
        }

        return (
          <motion.div
            style={{ scale, opacity, maxWidth: maxWidth || 'none' }}
            {...attrs}
          >
            <div className="relative">
              {content}

              {arrow && <Arrow data-popper-arrow="" {...attrs} />}
            </div>
          </motion.div>
        );
      }}
      animation
      onMount={onMount}
      onHide={onHide}
    >
      {children}
    </Tippy>
  );
};

export default Tooltip;
