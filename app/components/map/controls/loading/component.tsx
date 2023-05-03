import React from 'react';

import Loading from 'components/loading';

export interface LoadingControlProps {
  loading: boolean;
}

export const LoadingControl = ({ loading }: LoadingControlProps) => {
  return (
    <Loading
      className="relative inline-flex items-center justify-center p-0.5"
      iconClassName="w-6 h-6"
      visible={loading}
    />
  );
};

export default LoadingControl;
