import React from 'react';

import Icon from 'components/icon';
import LegendTypeGradient from 'components/map/legend/types/gradient';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

export interface SolutionFrequencyProps {
  values: any,
  frequencyOnMap?: boolean;
  onToggleFrequencyOnMap?: (frequencyMap: boolean) => void;
}

export const SolutionFrequency: React.FC<SolutionFrequencyProps> = ({
  values, frequencyOnMap, onToggleFrequencyOnMap,
}: SolutionFrequencyProps) => {
  return (
    <div className="w-full pb-6">
      <div className="flex items-center justify-between pb-4">
        <p className="text-sm font-heading">Selection Frequency</p>
        <button
          type="button"
          className="flex items-center justify-between flex-shrink-0 px-2 py-1 text-xs text-white border border-transparent focus:border-white rounded-4xl"
          onClick={() => onToggleFrequencyOnMap(!frequencyOnMap)}
        >
          {frequencyOnMap ? 'Hide from map' : 'View on map'}
          <Icon icon={frequencyOnMap ? HIDE_SVG : SHOW_SVG} className="w-5 h-6 ml-3" />
        </button>
      </div>
      <LegendTypeGradient
        className={{
          bar: 'h-3 rounded-lg',
          labels: 'text-sm text-gray-300',
        }}
        items={values}
      />
    </div>
  );
};

export default SolutionFrequency;
