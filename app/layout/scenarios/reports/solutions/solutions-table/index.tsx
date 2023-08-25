import React from 'react';

import { useRouter } from 'next/router';

import { useBestSolution, useSolutions } from 'hooks/solutions';

import Icon from 'components/icon/component';
import { cn } from 'utils/cn';

import STAR_SVG from 'svgs/ui/star.svg?sprite';

export const SolutionsTablePage = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const solutionsQuery = useSolutions(sid);
  const bestSolutionQuery = useBestSolution(sid, {});

  return (
    <div className="relative">
      <h2 className="py-6 text-sm font-medium uppercase">Solutions table</h2>

      <table className="absolute -left-[14mm] mt-4 w-[210mm]">
        <thead className="h-12 text-sm">
          <tr className="text-left font-semibold">
            <th className="w-1/6 px-20">Best</th>
            <th>Run</th>
            <th>Score</th>
            <th>Cost</th>
            <th className="w-1/6">Planning units</th>
            <th>Missing values</th>
          </tr>
        </thead>
        <tbody className="[&>*:nth-child(even)]:bg-gray-50 [&>*]:h-10">
          {solutionsQuery.data?.map((solution) => {
            return (
              <tr key={solution.id}>
                <td className="px-20">
                  <Icon
                    className={cn({
                      'hidden h-2 w-2 text-black': true,
                      block: solution.id === bestSolutionQuery.data?.id,
                    })}
                    icon={STAR_SVG}
                  />
                </td>
                <td>{solution.runId}</td>
                <td>{solution.score}</td>
                <td>{solution.cost}</td>
                <td>{solution.planningUnits}</td>
                <td>{solution.missingValues}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SolutionsTablePage;
