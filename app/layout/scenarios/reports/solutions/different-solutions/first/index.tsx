import React from 'react';

import { useRouter } from 'next/router';

import { useBestSolution } from 'hooks/solutions';

import Icon from 'components/icon/component';
import DifferentSolutionReportMap from 'layout/scenarios/reports/solutions/different-solutions/map';

import STAR_SVG from 'svgs/ui/star.svg?sprite';

const SOLUTION_INFO_BOX_CLASSES = 'border-l-[3px] border-primary-500 pl-2';

export const DifferentSolutionsPage = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const bestSolutionQuery = useBestSolution(sid, {});

  return (
    <div className="flex flex-col">
      <h2 className="py-6 text-sm font-medium uppercase">Best Solution</h2>
      <div className="flex flex-col space-y-3">
        <div key={bestSolutionQuery.data?.id} className="flex space-x-6 bg-gray-100 px-5 py-3">
          <DifferentSolutionReportMap id="report-map-3" runId={bestSolutionQuery.data?.runId} />
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-6">
              <p className="font-semibold">Run {bestSolutionQuery.data?.runId}</p>
              <div className="flex items-center space-x-4 rounded-2xl bg-primary-500 px-3 py-1">
                <p className="text-sm text-black">Best solution</p>
                <Icon className="h-3 w-3 text-black" icon={STAR_SVG} />
              </div>
            </div>
            <div className={SOLUTION_INFO_BOX_CLASSES}>
              <p>
                Score: <span className="font-medium">{bestSolutionQuery.data?.scoreValue}</span>
              </p>
            </div>
            <div className={SOLUTION_INFO_BOX_CLASSES}>
              <p>
                Missing:{' '}
                <span className="font-medium">{bestSolutionQuery.data?.missingValues}</span>
              </p>
            </div>
            <div className={SOLUTION_INFO_BOX_CLASSES}>
              <p>
                Cost: <span className="font-medium">{bestSolutionQuery.data?.costValue}</span>
              </p>
            </div>
            <div className={SOLUTION_INFO_BOX_CLASSES}>
              <p>
                PlanningUnits:{' '}
                <span className="font-medium">{bestSolutionQuery.data?.costValue}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifferentSolutionsPage;
