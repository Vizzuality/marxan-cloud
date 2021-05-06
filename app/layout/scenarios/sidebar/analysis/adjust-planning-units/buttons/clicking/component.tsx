import React from 'react';

export interface AnalysisAdjustClickingProps {

}

export const AnalysisAdjustClicking: React.FC<AnalysisAdjustClickingProps> = () => {
  return (
    <div className="flex w-full">
      <p className="text-sm text-gray-300">Click over the map, and select planning units.</p>
    </div>
  );
};

export default AnalysisAdjustClicking;
