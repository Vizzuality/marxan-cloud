import React, { useMemo } from 'react';

import { useRouter } from 'next/router';

import { LEGEND_LAYERS } from 'hooks/map/constants';
import { useScenario } from 'hooks/scenarios';
import { useBestSolution, useSolution } from 'hooks/solutions';

import ScenarioReportsMap from 'layout/scenarios/reports/solutions/page-2/map';

import LegendItem from 'components/map/legend/item/component';

export interface ScenariosReportPage2Props {

}

export const ScenariosReportPage2: React.FC<ScenariosReportPage2Props> = () => {
  const { query } = useRouter();
  const { sid, solutionId } = query;

  const {
    data: scenarioData,
  } = useScenario(sid);

  const {
    data: selectedSolutionData,
  } = useSolution(sid, solutionId);

  const {
    data: bestSolutionData,
  } = useBestSolution(sid, {
    enabled: scenarioData?.ranAtLeastOnce,
  });

  const SOLUTION_DATA = selectedSolutionData || bestSolutionData;

  const LEGEND = useMemo(() => {
    return {
      ...LEGEND_LAYERS.solution(),
      name: `Solution ${SOLUTION_DATA?.runId}`,
      settingsManager: null,
    };
  }, [SOLUTION_DATA]);

  return (
    <div className="flex space-x-4">
      <section className="flex flex-col justify-between w-1/3 text-xs">
        <div className="space-y-8">
          <div>
            <p className="font-semibold">Solution</p>
            <p>{SOLUTION_DATA?.runId}</p>
          </div>

          <div>
            <p className="font-semibold">Score</p>
            <p>{SOLUTION_DATA?.scoreValue}</p>
          </div>
          <div>
            <p className="font-semibold">Cost</p>
            <p>{SOLUTION_DATA?.costValue}</p>
          </div>
          <div>
            <p className="font-semibold">Missing</p>
            <p>{SOLUTION_DATA?.missingValues}</p>
          </div>
          <div>
            <p className="font-semibold">Planning</p>
            <p>{SOLUTION_DATA?.planningUnits}</p>
          </div>
        </div>

        <div className="py-5 border-t border-gray-500 mr-14">
          <LegendItem
            {...LEGEND}
            key="solution"
            className="block"
            theme="light"
          />
        </div>
      </section>

      <ScenarioReportsMap id="report-map-2" />
    </div>
  );
};

export default ScenariosReportPage2;
