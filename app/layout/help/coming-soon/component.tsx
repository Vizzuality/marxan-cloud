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
  placement = 'top',
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
          <div className="px-2 py-1 text-gray-500 bg-white rounded">
            <span>Coming soon</span>
          </div>
        )}

      >
        <div className="opacity-50">
          <div className="">
            {CHILDREN}
          </div>
        </div>
      </Tooltip>
    </>
  );
};

export default ComingSoon;
