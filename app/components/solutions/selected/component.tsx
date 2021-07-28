import React from 'react';

import Icon from 'components/icon';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';
import STAR_SVG from 'svgs/ui/star.svg?sprite';

export interface SelectedSolutionProps {
  id: string;
  best: boolean;
  values: {
    runId: number;
    scoreValue: number;
    costValue: number,
    missingValues: number,
    planningUnits: number,
  };
  onMap?: boolean;
  onToggleOnMap?: (onMap: boolean) => void;
}

export const SelectedSolution: React.FC<SelectedSolutionProps> = ({
  best = false, values, onMap, onToggleOnMap,
}: SelectedSolutionProps) => {
  const {
    runId, scoreValue, costValue, missingValues, planningUnits,
  } = values;

  return (
    <>
      <div className="flex justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="relative w-4 h-4 bg-blue-700 rounded" />
            <p className="mr-4 text-sm text-white font-heading">
              {`Run ${runId}`}
            </p>
          </div>
          {best && (
            <div className="flex items-center">
              <p className="text-sm text-blue-400">Best solution</p>
              <Icon icon={STAR_SVG} className="w-3 h-3 ml-3 text-blue-400" />
            </div>
          )}
        </div>
        <button
          type="button"
          className="flex items-center justify-between flex-shrink-0 px-2 py-1 text-xs text-white border border-transparent focus:border-white rounded-4xl"
          onClick={() => onToggleOnMap(!onMap)}
        >
          {onMap ? 'Hide from map' : 'View on map'}
          <Icon icon={onMap ? HIDE_SVG : SHOW_SVG} className="w-5 h-5 ml-3" />
        </button>
      </div>
      <div className="grid grid-cols-2 pt-5 pl-1 pr-16 text-sm text-white gap-y-6 gap-x-12">
        <div className="flex pl-1.5 text-white border-l-2 border-blue-700 justify-between">
          <p>Score:</p>
          <p className="w-20 font-semibold text-left">{scoreValue}</p>
        </div>
        <div className="flex pl-1.5 text-white border-l-2 border-blue-700 justify-between">
          <p>Cost:</p>
          <p className="w-20 font-semibold text-left">{costValue}</p>
        </div>
        <div className="flex pl-1.5 text-white border-l-2 border-blue-700 justify-between">
          <p>Missing:</p>
          <p className="w-20 font-semibold text-left">{missingValues}</p>
        </div>
        <div className="flex pl-1.5 text-white border-l-2 border-blue-700 justify-between">
          <p>Planning:</p>
          <p className="w-20 font-semibold text-left">{planningUnits}</p>
        </div>
      </div>
    </>
  );
};

export default SelectedSolution;
