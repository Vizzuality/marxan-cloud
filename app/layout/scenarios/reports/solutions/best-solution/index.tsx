import React, { useMemo } from 'react';

import { useRouter } from 'next/router';

import { LEGEND_LAYERS } from 'hooks/map/constants';
import { useBestSolution } from 'hooks/solutions';

import LegendItem from 'components/map/legend/item';
import BestSolutionReportMap from 'layout/scenarios/reports/solutions/best-solution/map';

export const BestSolutionPage = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const bestSolutionQuery = useBestSolution(sid, {});

  const LEGEND = useMemo(() => {
    return {
      ...LEGEND_LAYERS.solution(),
      name: `Best solution (RUN ${bestSolutionQuery.data?.runId})`,
      settingsManager: null,
    };
  }, [bestSolutionQuery.data?.runId]);

  return (
    <div className="flex flex-col">
      <BestSolutionReportMap id="report-map-3" />
      <div className="py-5">
        <LegendItem {...LEGEND} key="solution" theme="light" className="text-left font-semibold" />
      </div>
    </div>
  );
};

export default BestSolutionPage;
