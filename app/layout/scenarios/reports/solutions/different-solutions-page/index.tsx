import React from 'react';

import { useRouter } from 'next/router';

import { useMostDifferentSolutions } from 'hooks/solutions';

import DifferentSolutionReportMap from 'layout/scenarios/reports/solutions/different-solutions-page/map';

export const DifferentSolutionsPage = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const mostDifSolutionsQuery = useMostDifferentSolutions(sid);

  const SOLUTION_INFO_BOX_CLASSES = 'border-l-[3px] border-primary-500 pl-2';

  return (
    <div className="flex flex-col">
      <h2 className="py-6 text-base font-medium uppercase">Five most different solutions</h2>
      <div className="flex flex-col space-y-3">
        {mostDifSolutionsQuery.data?.map((solution) => {
          return (
            <div key={solution.id} className="flex space-x-6 bg-gray-50 px-5 py-3">
              <DifferentSolutionReportMap id="report-map-3" runId={solution.runId} />
              <div className="flex flex-col space-y-4">
                <p className="font-semibold">Run {solution.runId}</p>
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
