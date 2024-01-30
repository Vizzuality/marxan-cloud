import React from 'react';

import { COLORS } from 'hooks/map/constants';

import Icon from 'components/icon';

import STAR_SVG from 'svgs/ui/star.svg?sprite';

export interface SelectedSolutionProps {
  best: boolean;
  values: {
    runId: number;
    scoreValue: number;
    costValue: number;
    missingValues: number;
    planningUnits: number;
  };
  settings?: {
    visibility: boolean;
  };
  onChangeVisibility?: () => void;
}

export const SelectedSolution: React.FC<SelectedSolutionProps> = ({
  best = false,
  values,
}: SelectedSolutionProps) => {
  const { runId, scoreValue, costValue, missingValues, planningUnits } = values || {};

  return (
    <div className="w-full">
      <div className="flex justify-between">
        <div className="flex items-center space-x-4">
          {runId && (
            <div className="flex items-center space-x-2">
              <div
                className="relative h-4 w-3.5"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  backgroundColor: COLORS.primary,
                }}
              />
              <p className="mr-4 pl-1 font-heading text-sm text-white">{`Run ${runId}`}</p>
            </div>
          )}
          {best && (
            <div className="flex items-center">
              <p className="text-sm text-blue-500">Best solution</p>
              <Icon icon={STAR_SVG} className="ml-3 h-3 w-3 text-blue-500" />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-6 pt-5 text-sm text-white">
        <div className="flex space-x-2 border-l-2 border-blue-800 pl-2.5 text-white">
          <p>Score:</p>
          <p className="text-left font-semibold">{scoreValue}</p>
        </div>
        <div className="flex space-x-2 border-l-2 border-blue-800 pl-2.5 text-white">
          <p>Cost:</p>
          <p className="text-left font-semibold">{costValue}</p>
        </div>
        <div className="flex space-x-2 border-l-2 border-blue-800 pl-2.5 text-white">
          <p>Missing:</p>
          <p className="text-left font-semibold">{missingValues}</p>
        </div>
        <div className="flex space-x-2 border-l-2 border-blue-800 pl-2.5 text-white">
          <p>Planning Units:</p>
          <p className="text-left font-semibold">{planningUnits}</p>
        </div>
      </div>
    </div>
  );
};

export default SelectedSolution;
