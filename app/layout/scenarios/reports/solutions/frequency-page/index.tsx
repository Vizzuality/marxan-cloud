import React, { useMemo } from 'react';

import { useRouter } from 'next/router';

import { LEGEND_LAYERS } from 'hooks/map/constants';
import { useScenario } from 'hooks/scenarios';

import LegendItem from 'components/map/legend/item/component';
import LegendTypeGradient from 'components/map/legend/types/gradient/component';
import FrequencyReportMap from 'layout/scenarios/reports/solutions/frequency-page/map';

export const FrequencyPage = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const scenarioQuery = useScenario(sid);

  console.log(scenarioQuery.data);

  const LEGEND = useMemo(() => {
    return {
      ...LEGEND_LAYERS.frequency({
        options: {
          numberOfRuns: scenarioQuery.data?.numberOfRuns,
        },
      }),
      name: `Frequency (${scenarioQuery.data?.numberOfRuns})`,
      settingsManager: null,
    };
  }, [scenarioQuery.data?.numberOfRuns]);

  return (
    <div className="flex flex-col">
      <FrequencyReportMap id="report-map-2" />
      <div className="flex flex-col space-y-3 py-8">
        <LegendItem {...LEGEND} key="frequency" theme="light" className="text-left font-semibold" />
        <LegendTypeGradient className={{ box: 'w-1/2 text-sm', bar: 'h-3' }} items={LEGEND.items} />
      </div>
    </div>
  );
};

export default FrequencyPage;
