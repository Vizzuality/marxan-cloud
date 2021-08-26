import React, {
  ReactElement, cloneElement,
  useRef,
} from 'react';

import type { Placement } from '@popperjs/core';

import Tooltip from 'components/tooltip';

export interface ComingSoonProps {
  children: ReactElement;
  placement?: Placement;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  children,
  placement = 'bottom',
}: ComingSoonProps) => {
  const childrenRef = useRef(null);

  const CHILDREN = cloneElement(children, {
    ref: childrenRef,
  });

  return (
    <>
      <Tooltip
        arrow
        placement={placement}
        maxWidth={350}
        content={(
          <div className="px-4 py-1.5 text-xs text-gray-500 bg-white rounded">
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
    </>
  );
};

export default ComingSoon;
