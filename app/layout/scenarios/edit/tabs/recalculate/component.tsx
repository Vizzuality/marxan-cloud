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
          <div className="mt-4 h-px w-full bg-gradient-to-r from-black via-gray-300 to-black opacity-20" />
          <div className="flex w-full items-center justify-between pt-4">
            <p className="font-heading text-xs font-medium uppercase text-red-600">
              Your information and solutions are outdated
            </p>
            <Button theme="primary" size="xs" onClick={onRecalculate}>
              Recalculate
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default Recalculate;
