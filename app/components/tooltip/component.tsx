import React, { useRef } from 'react';

import Tippy from '@tippyjs/react/headless';
import { useSpring, motion } from 'framer-motion';
import { SpringOptions } from 'popmotion';

import { cn } from 'utils/cn';

import Arrow from './arrow';
import { TooltipProps } from './types';

export const Tooltip = ({
  children,
  content,
  contentClassName,
  arrow,
  arrowClassName,
  interactive,
  popup,
  maxWidth,
  maxHeight,
  onHide,
  onMount,
  animation,
  ...props
}: TooltipProps) => {
  const tooltipRef = useRef(null);
  const springConfig: SpringOptions = { damping: 15, stiffness: 300 };
  const opacity = useSpring(0, springConfig);
  const scale = useSpring(0.95, springConfig);

  function handleMount(targets) {
    scale.set(1);
    opacity.set(1);

    if (onMount) onMount(targets);
  }

  function handleHide(targets) {
    const { unmount } = targets;
    const cleanup = scale.onChange((value) => {
      if (value <= 0.95) {
        cleanup();
        unmount();
      }
    });

    scale.set(0.95);
    opacity.set(0);

    if (onHide) onHide(targets);
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
            {...(animation && {
              style: {
                scale,
                opacity,
              },
            })}
            {...attrs}
          >
            <div className="relative shadow-2xl">
              <div
                className={cn({
                  'flex-column relative flex flex-grow overflow-hidden': true,
                  [contentClassName]: !!contentClassName,
                })}
                style={{ maxWidth: maxWidth || 'none', maxHeight: maxHeight || '100vh' }}
              >
                {interactive && !popup && (
                  <div className="pointer-events-none absolute left-0 top-0 z-10 h-5 w-full bg-gradient-to-b from-white via-white" />
                )}

                <div className="overflow-y-auto overflow-x-hidden">{content}</div>

                {interactive && !popup && (
                  <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-5 w-full bg-gradient-to-t from-white via-white" />
                )}
              </div>

              {arrow && <Arrow className={arrowClassName} data-popper-arrow="" {...attrs} />}
            </div>
          </motion.div>
        );
      }}
      animation={animation}
      onMount={handleMount}
      onHide={handleHide}
    >
      {children}
    </Tippy>
  );
};

export default Tooltip;
