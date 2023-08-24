import React from 'react';

import { useRouter } from 'next/router';

import { useTargetedFeatures } from 'hooks/features';

export const FeaturePage = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const targetedFeaturesQuery = useTargetedFeatures(sid);

  return (
    <table className="mt-6">
      <thead className="h-12 text-sm">
        <tr className="text-left font-semibold">
          <th>Feature name</th>
          <th>Target</th>
          <th>SPF</th>
        </tr>
      </thead>
      <tbody>
        {targetedFeaturesQuery.data?.map((feature) => {
          return (
            <tr key={feature.id}>
              <td>{feature.name}</td>
              <td>{feature.target}%</td>
              <td>{feature.fpf}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default FeaturePage;
