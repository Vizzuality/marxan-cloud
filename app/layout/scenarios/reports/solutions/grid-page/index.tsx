import React, { useMemo } from 'react';

import { LEGEND_LAYERS } from 'hooks/map/constants';

import LegendItem from 'components/map/legend/item/component';
import GridReportMap from 'layout/scenarios/reports/solutions/grid-page/map';

export const PlanningUnitGridPage = (): JSX.Element => {
  const LEGEND = useMemo(() => {
    return {
      ...LEGEND_LAYERS.pugrid(),
      name: 'Planning Unit Grid',
      settingsManager: null,
    };
  }, []);

  return (
    <div className="flex flex-col">
      <GridReportMap id="report-map-1" />
      <div className="py-5">
        <LegendItem {...LEGEND} key="pugrid" theme="light" className="text-left font-semibold" />
      </div>
    </div>
  );
};

export default PlanningUnitGridPage;
