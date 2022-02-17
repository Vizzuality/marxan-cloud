import React from 'react';

import { useRouter } from 'next/router';

import { useSelectedFeatures } from 'hooks/features';

export interface ScenariosReportPage3Props {

}

export const ScenariosReportPage3: React.FC<ScenariosReportPage3Props> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const {
    data: featuresData,
    isFetched: featuresDataIsFetched,
  } = useSelectedFeatures(sid, {});

  return (
    featuresDataIsFetched && (
      <section className="w-full pt-4 text-xs">
        <div>
          <p className="pb-2 font-medium">Feature name, target, spf:</p>
          {featuresData.map((f) => {
            const { featureId, name, marxanSettings: { fpf: spf, prop: target } } = f;
            return (
              <p className="leading-5" key={featureId}>{`${name}, ${target * 100}%, ${spf}`}</p>
            );
          })}
        </div>
      </section>
    )
  );
};

export default ScenariosReportPage3;
