import React, { useRef } from 'react';

import Tippy from '@tippyjs/react/headless';
import { useSpring, motion } from 'framer-motion';
import { SpringOptions } from 'popmotion';

import Arrow from './arrow';
import { TooltipProps } from './types';

export const Tooltip: React.FC<TooltipProps> = ({
  children, content, arrow, interactive, maxWidth, maxHeight, ...props
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
      appendTo={typeof window !== 'undefined' ? document.body : 'parent'}
      interactive={interactive}
      {...props}
      render={(attrs) => {
        if (typeof attrs['data-reference-hidden'] !== 'undefined') {
          tooltipRef.current._tippy.hide(); // eslint-disable-line
        }

        return (
          <motion.div
            style={{
              scale, opacity,
            }}
            {...attrs}
          >
            <div className="relative shadow-2xl">
              <div className="relative flex flex-grow overflow-hidden flex-column" style={{ maxWidth: maxWidth || 'none', maxHeight: maxHeight || '100vh' }}>
                {interactive && (
                  <div className="absolute top-0 left-0 z-10 w-full h-5 pointer-events-none bg-gradient-to-b from-white via-white" />
                )}

                <div className="overflow-x-hidden overflow-y-auto">
                  {content}
                </div>

                {interactive && (
                  <div className="absolute bottom-0 left-0 z-10 w-full h-5 pointer-events-none bg-gradient-to-t from-white via-white" />
                )}

              </div>

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
