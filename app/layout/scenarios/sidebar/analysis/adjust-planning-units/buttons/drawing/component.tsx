import React from 'react';

export interface AnalysisAdjustDrawingProps {

}

export const AnalysisAdjustDrawing: React.FC<AnalysisAdjustDrawingProps> = () => {
  return (
    <div className="flex w-full">
      <p className="text-sm text-gray-300">Click over the map, and select planning units.</p>
    </div>
  );
};

export default AnalysisAdjustDrawing;
