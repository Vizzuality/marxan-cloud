import React from 'react';

import { PLACEMENTS } from 'hooks/toast/constants';
import { ToastContainerProps } from 'hooks/toast/types';

export const ToastContainer = ({
  placement,
  ...props
}: ToastContainerProps) => (
  <div
    className="fixed w-full max-w-full max-h-full p-5 pointer-events-none z-60"
    style={{
      ...PLACEMENTS[placement],
      maxWidth: 400,
    }}
    {...props}
  />
);

export default ToastContainer;
