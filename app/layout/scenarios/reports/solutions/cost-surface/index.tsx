import React, { useMemo } from 'react';

import { LEGEND_LAYERS } from 'hooks/map/constants';

import LegendItem from 'components/map/legend/item/component';
import CostSurfaceReportMap from 'layout/scenarios/reports/solutions/cost-surface/map';

export const CostSurfaceReport = (): JSX.Element => {
  const LEGEND = useMemo(() => {
    return {
      ...LEGEND_LAYERS.cost({
        min: 0,
        max: 1,
      }),
      name: 'Cost surface',
      settingsManager: null,
    };
  }, []);

  return (
    <div className="flex flex-col">
      <CostSurfaceReportMap id="report-map-cost-surface" />
      <div className="py-5">
        <LegendItem {...LEGEND} key="cost" theme="light" className="text-left font-semibold" />
      </div>
    </div>
  );
};

export default CostSurfaceReport;
