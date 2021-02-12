import React from 'react';
import cx from 'classnames';

import Icon from 'components/icon';
import LOADING_SVG from 'svgs/ui/loading.svg?sprite';
import { useTransition, animated } from 'react-spring';

export interface LoadingProps {
  visible?: boolean;
  className?: string;
  iconClassName?: string;
}

export const Loading = ({
  visible = false,
  className = 'absolute',
  iconClassName = 'w-5 h-5',
}: LoadingProps) => {
  const transitions = useTransition(visible, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return transitions.map(({ item, key, props }) => item && (
    <animated.div
      key={key}
      style={props}
      className={cx({
        [className]: !!className,
      })}
    >
      <Icon icon={LOADING_SVG} className={iconClassName} />
    </animated.div>
  ));
};

export default Loading;
