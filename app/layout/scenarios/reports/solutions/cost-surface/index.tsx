import React, { useMemo } from 'react';

import { useRouter } from 'next/router';

import { LEGEND_LAYERS } from 'hooks/map/constants';
import { useCostSurfaceRange } from 'hooks/scenarios';

import LegendItem from 'components/map/legend/item/component';
import LegendTypeGradient from 'components/map/legend/types/gradient/component';
import CostSurfaceReportMap from 'layout/scenarios/reports/solutions/cost-surface/map';

export const CostSurfaceReport = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };
  const costSurfaceQuery = useCostSurfaceRange(sid);

  const LEGEND = useMemo(() => {
    return {
      ...LEGEND_LAYERS.cost({ cost: costSurfaceQuery.data }),
      name: 'Cost layer',
      settingsManager: null,
    };
  }, [costSurfaceQuery.data]);

  return (
    <div className="flex space-x-6 bg-gray-100 px-10 py-3">
      <CostSurfaceReportMap id="report-map-cost-surface" />
      <div className="w-2/6 py-5">
        <LegendItem {...LEGEND} key="cost" theme="light" className="text-left font-semibold" />
        <LegendTypeGradient
          className={{ box: 'w-full text-sm', bar: 'h-3' }}
          items={LEGEND.items}
        />
      </div>
    </div>
  );
};

export default CostSurfaceReport;
