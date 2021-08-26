import React, {
  ReactElement, cloneElement,
  useRef,
} from 'react';

import cx from 'classnames';

import Tooltip from 'components/tooltip';

export interface ComingSoonProps {
  children: ReactElement;
  className?: {
    arrow?: string;
    box?: string;
  }
  placement?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  children,
  className,
}: ComingSoonProps) => {
  const childrenRef = useRef(null);

  const CHILDREN = cloneElement(children, {
    ref: childrenRef,
  });

  return (
    <Tooltip
      arrow
      arrowClassName={cx({
        [className?.arrow]: !!className?.arrow,
      })}
      placement="bottom"
      maxWidth={350}
      content={(
        <div
          className={cx({
            'px-4 py-1.5 text-xs text-gray-500 bg-white rounded': true,
            [className?.box]: !!className?.box,
          })}
        >
          <span>Feature coming soon!</span>
        </div>
      )}
    >
      <div className="opacity-60">
        <div className="pointer-events-none">
          {CHILDREN}
        </div>
      </div>
    </Tooltip>
  );
};

export default ComingSoon;
