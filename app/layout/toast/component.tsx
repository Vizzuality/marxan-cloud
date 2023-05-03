import React from 'react';

import { PLACEMENTS } from 'hooks/toast/constants';
import { ToastContainerProps } from 'hooks/toast/types';

export const ToastContainer = ({ placement, ...props }: ToastContainerProps) => (
  <div
    className="pointer-events-none fixed z-60 max-h-full w-full max-w-full p-5"
    style={{
      ...PLACEMENTS[placement],
      maxWidth: 400,
    }}
    {...props}
  />
);

export default ToastContainer;
