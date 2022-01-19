import React from 'react';

import Button from 'components/button';

export interface RecalculateProps {
  visible: boolean;
  onRecalculate: () => void;
}

export const Recalculate: React.FC<RecalculateProps> = ({
  visible = false,
  onRecalculate,
}: RecalculateProps) => {
  return (
    <>
      {visible && (
        <>
          <div className="w-full h-px mt-4 bg-gradient-to-r from-black opacity-20 to-black via-gray-200" />
          <div className="flex items-center justify-between w-full pt-4">
            <p className="text-xs font-medium text-red-500 uppercase font-heading">Your information and solutions are outdated</p>
            <Button
              theme="primary"
              size="xs"
              onClick={onRecalculate}
            >
              Recalculate
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default Recalculate;
