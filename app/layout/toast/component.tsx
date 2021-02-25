import React from 'react';
import { ToastContainerProps } from 'hooks/toast/types';
import { PLACEMENTS } from 'hooks/toast/constants';

export const ToastContainer = ({
  hasToasts,
  placement,
  ...props
}: ToastContainerProps) => (
  <div
    className="fixed z-50 max-w-full max-h-full p-5 overflow-hidden"
    style={{
      pointerEvents: hasToasts ? null : 'none',
      ...PLACEMENTS[placement],
    }}
    {...props}
  />
);

export default ToastContainer;
