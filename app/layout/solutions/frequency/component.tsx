import React from 'react';

import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import LegendTypeGradient from 'components/map/legend/types/gradient';

import FREQUENCY_MAP_IMG from 'images/info-buttons/img_frequency_map.png';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

export interface SolutionFrequencyProps {
  values: any;
  settings?: {
    visibility: boolean;
  };
  onChangeVisibility?: () => void;
}

export const SolutionFrequency: React.FC<SolutionFrequencyProps> = ({
  values,
  settings,
  onChangeVisibility,
}: SolutionFrequencyProps) => {
  const { visibility = true } = settings || {};

  return (
    <div className="w-full pb-6">
      <div className="flex items-center justify-between pb-4">
        <div className="flex space-x-2">
          <p className="font-heading text-sm">Selection Frequency</p>
          <InfoButton>
            <span>
              <h4 className="mb-2.5 font-heading text-lg">Selection Frequency</h4>
              <div className="space-x-2">
                <p className="mb-6">
                  Selection Frequency (SF) is the summed output of all solutions and can be used to
                  understand the relative irreplaceability of any planning unit and identify
                  priority areas in your planning region. Best practice is to run Marxan 100 times
                  so that the SF ranges from 0 (never selected) and 100 (always selected). Note: be
                  mindful if you have set the planning unit status to “locked in”, as these areas
                  will also have an SF = 100.
                </p>

                <img src={FREQUENCY_MAP_IMG} alt="Selection frequency" />
              </div>
            </span>
          </InfoButton>
        </div>
        <button
          type="button"
          className="flex flex-shrink-0 items-center justify-between rounded-[40px] border border-transparent px-2 py-1 text-xs text-white focus:border-white"
          onClick={onChangeVisibility}
        >
          {visibility ? 'View on map' : 'Hide from map'}
          <Icon icon={visibility ? SHOW_SVG : HIDE_SVG} className="ml-3 h-6 w-5" />
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
