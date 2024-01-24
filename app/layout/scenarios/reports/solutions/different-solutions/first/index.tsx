import React from 'react';

import { useRouter } from 'next/router';

import { useBestSolution, useMostDifferentSolutions } from 'hooks/solutions';

import Icon from 'components/icon/component';
import DifferentSolutionReportMap from 'layout/scenarios/reports/solutions/different-solutions/map';
import { cn } from 'utils/cn';

import STAR_SVG from 'svgs/ui/star.svg?sprite';

export const DifferentSolutionsPage = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const mostDifSolutionsQuery = useMostDifferentSolutions(sid);

  const bestSolutionQuery = useBestSolution(sid, {});

  const SOLUTION_INFO_BOX_CLASSES = 'border-l-[3px] border-primary-500 pl-2';

  return (
    <div className="flex flex-col">
      <h2 className="py-6 text-sm font-medium uppercase">Five most different solutions</h2>
      <div className="flex flex-col space-y-3">
        {mostDifSolutionsQuery.data?.slice(0, 2).map((solution) => {
          return (
            <div key={solution.id} className="flex space-x-6 bg-gray-100 px-5 py-3">
              <DifferentSolutionReportMap id="report-map-3" runId={solution.runId} />
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-6">
                  <p className="font-semibold">Run {solution.runId}</p>
                  <div
                    className={cn({
                      'hidden rounded-2xl bg-primary-500 px-3 py-1': true,
                      'flex items-center space-x-4': solution.id === bestSolutionQuery.data?.id,
                    })}
                  >
                    <p className="text-sm text-black">Best solution</p>
                    <Icon className="h-3 w-3 text-black" icon={STAR_SVG} />
                  </div>
                </div>
                <div className={SOLUTION_INFO_BOX_CLASSES}>
                  <p>
                    Score: <span className="font-medium">{solution.score}</span>
                  </p>
                </div>
                <div className={SOLUTION_INFO_BOX_CLASSES}>
                  <p>
                    Missing: <span className="font-medium">{solution.missingValues}</span>
                  </p>
                </div>
                <div className={SOLUTION_INFO_BOX_CLASSES}>
                  <p>
                    Cost: <span className="font-medium">{solution.cost}</span>
                  </p>
                </div>
                <div className={SOLUTION_INFO_BOX_CLASSES}>
                  <p>
                    PlanningUnits: <span className="font-medium">{solution.cost}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DifferentSolutionsPage;
