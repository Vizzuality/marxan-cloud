import React from 'react';
import { ToastContainerProps } from 'hooks/toast/types';
import { PLACEMENTS } from 'hooks/toast/constants';

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
