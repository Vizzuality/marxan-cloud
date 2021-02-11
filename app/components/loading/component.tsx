import React from 'react';
import cx from 'classnames';

import Icon from 'components/icon';
import LOADING_SVG from 'svgs/ui/loading.svg?sprite';

export interface LoadingProps {
  visible?: boolean;
  className?: string;
  iconClassName?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  visible = false,
  className = 'absolute',
  iconClassName = 'w-5 h-5',
}: LoadingProps) => {
  if (!visible) return null;

  return (
    <div className={cx({
      [className]: !!className,
    })}
    >
      <Icon icon={LOADING_SVG} className={iconClassName} />
    </div>
  );
};

export default Loading;
