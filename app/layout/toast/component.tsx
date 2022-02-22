import React from 'react';

import { PLACEMENTS } from 'hooks/toast/constants';
import { ToastContainerProps } from 'hooks/toast/types';

export const ToastContainer = ({
  placement,
  ...props
}: ToastContainerProps) => (
  <div
    className="fixed z-50 w-full max-w-full max-h-full p-5 pointer-events-none"
    style={{
      ...PLACEMENTS[placement],
      maxWidth: 400,
    }}
    {...props}
  />
);

export default ToastContainer;
