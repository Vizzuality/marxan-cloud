import React from 'react';

import { LEGEND_LAYERS } from 'hooks/map/constants';

import ScenarioReportsMap from 'layout/scenarios/reports/map';

import LegendTypeGradient from 'components/map/legend/types/gradient';

export interface ScenariosReportPage2Props {

}

export const ScenariosReportPage2: React.FC<ScenariosReportPage2Props> = () => {
  const frequencyLegendValues = LEGEND_LAYERS.frequency().items;

  return (
    <div className="flex space-x-4">

      <section className="w-1/3 space-y-8 text-xs">

        <div className="space-y-4 border-t-4 border-gray-700">
          <p className="pt-2 font-sans font-semibold uppercase"> Legend:</p>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 border border-black rounded-sm" />
            <p className="font-heading">Protected Areas</p>
          </div>
        </div>

        <div className="pt-4 space-y-4 border-t border-black border-opacity-30">
          <p className="text-sm font-heading">Solutions:</p>
          <p className="text-xs font-heading">Selection Frequency</p>

          <div className="w-full pr-14">
            <LegendTypeGradient
              className={{
                bar: 'h-3 rounded-lg',
                labels: 'text-sm text-gray-300',
              }}
              items={frequencyLegendValues}
            />
          </div>
        </div>

      </section>

      <ScenarioReportsMap />

    </div>
  );
};

export default ScenariosReportPage2;
