import React, { ReactElement } from 'react';

import Tippy, { TippyProps } from '@tippyjs/react/headless';
import { useSpring, animated } from 'react-spring';

export interface TooltipProps extends TippyProps {
  children: ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, ...props }: TooltipProps) => {
  const config = { tension: 500, friction: 25 };
  const initialStyles = { opacity: 0, transform: 'scale(0.75)' };
  const [styles, setStyles] = useSpring(() => initialStyles);

  function onMount() {
    setStyles({
      opacity: 1,
      transform: 'scale(1)',
      onRest: () => {},
      config,
    });
  }

  function onHide({ unmount }) {
    setStyles({
      ...initialStyles,
      onRest: unmount,
      config: { ...config, clamp: true },
    });
  }

  return (
    <Tippy
      {...props}
      render={(attrs) => (
        <animated.div style={styles} {...attrs}>
          <div className="text-gray-500 bg-white">
            {content}
          </div>
        </animated.div>
      )}
      animation
      onMount={onMount}
      onHide={onHide}
    >
      {children}
    </Tippy>
  );
};

export default Tooltip;
