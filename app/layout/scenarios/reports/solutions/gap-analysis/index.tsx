import React from 'react';

import { useRouter } from 'next/router';

import { usePreGapAnalysis } from 'hooks/gap-analysis';

import { cn } from 'utils/cn';

export const GapAnalysisPage = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const allFeaturesQuery = usePreGapAnalysis(sid, {});

  return (
    <>
      <h2 className="py-6 text-sm font-medium uppercase">Summary of Gap Analysis</h2>

      {allFeaturesQuery.data?.length > 0 && (
        <table className="text-xs">
          <thead className="h-12">
            <tr className="text-left font-semibold">
              <th>Feature name</th>
              <th>Current</th>
              <th>Target</th>
              <th>Target met</th>
            </tr>
          </thead>
          <tbody className="[&>*]:h-7">
            {allFeaturesQuery.data?.map((feature) => {
              return (
                <tr key={feature.id}>
                  <td>{feature.name}</td>
                  <td>
                    {(feature.current.percent * 100).toFixed(0)}% ({feature.current.value}
                    {feature.current.unit})
                  </td>
                  <td>
                    {(feature.target.percent * 100).toFixed(0)}% ({feature.target.value}
                    {feature.target.unit})
                  </td>
                  <td>
                    <div
                      className={cn({
                        'flex w-9 items-center justify-center rounded-2xl bg-opacity-10': true,
                        'bg-green-600 text-green-600': feature.onTarget,
                        'bg-red-600 text-red-600': !feature.onTarget,
                      })}
                    >
                      {feature.onTarget ? 'Yes' : 'No'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
};

export default GapAnalysisPage;
