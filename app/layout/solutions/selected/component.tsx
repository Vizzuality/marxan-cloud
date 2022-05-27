import React from 'react';

import { COLORS } from 'hooks/map/constants';

import Icon from 'components/icon';

import STAR_SVG from 'svgs/ui/star.svg?sprite';

export interface SelectedSolutionProps {
  best: boolean;
  values: {
    runId: number;
    scoreValue: number;
    costValue: number,
    missingValues: number,
    planningUnits: number,
  };
  settings?: {
    visibility: boolean,
  }
  onChangeVisibility?: () => void;
}

export const SelectedSolution: React.FC<SelectedSolutionProps> = ({
  best = false, values,
}: SelectedSolutionProps) => {
  const {
    runId, scoreValue, costValue, missingValues, planningUnits,
  } = values;

  return (
    <div className="w-full">
      <div className="flex justify-between">
        <div className="flex items-center space-x-4">
          {runId && (
            <div className="flex items-center space-x-2">
              <div className="relative w-3.5 h-4" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', backgroundColor: COLORS.primary }} />
              <p className="pl-1 mr-4 text-sm text-white font-heading">
                {`Run ${runId}`}
              </p>
            </div>
          )}
          {best && (
            <div className="flex items-center">
              <p className="text-sm text-blue-400">Best solution</p>
              <Icon icon={STAR_SVG} className="w-3 h-3 ml-3 text-blue-400" />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 pt-5 pr-32 text-sm text-white gap-y-6 gap-x-5">
        <div className="flex pl-2.5 text-white border-l-2 border-blue-700 space-x-2">
          <p>Score:</p>
          <p className="font-semibold text-left">{scoreValue}</p>
        </div>
        <div className="flex pl-2.5 text-white border-l-2 border-blue-700 space-x-2">
          <p>Cost:</p>
          <p className="font-semibold text-left">{costValue}</p>
        </div>
        <div className="flex pl-2.5 text-white border-l-2 border-blue-700 space-x-2">
          <p>Missing:</p>
          <p className="font-semibold text-left">{missingValues}</p>
        </div>
        <div className="flex pl-2.5 text-white border-l-2 border-blue-700 space-x-2">
          <p>Planning:</p>
          <p className="font-semibold text-left">{planningUnits}</p>
        </div>
      </div>
    </div>
  );
};

export default SelectedSolution;
