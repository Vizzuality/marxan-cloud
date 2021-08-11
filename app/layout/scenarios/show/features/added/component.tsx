import React from 'react';

import { useRouter } from 'next/router';

// import cx from 'classnames';

import { useTargetedFeatures } from 'hooks/features';

import Item from 'components/features/target-spf-item';
import Loading from 'components/loading';

export interface ScenariosFeaturesListProps {
}

export const ScenariosFeaturesList: React.FC<ScenariosFeaturesListProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const {
    data: targetedFeaturesData,
    isFetching: targetedFeaturesIsFetching,
    isFetched: targetedFeaturesIsFetched,
  } = useTargetedFeatures(sid);

  // const INITIAL_VALUES = useMemo(() => {
  //   return {
  //     features: targetedFeaturesData,
  //   };
  // }, [targetedFeaturesData]);

  // Render
  if (targetedFeaturesIsFetching && !targetedFeaturesIsFetched) {
    return (
      <Loading
        visible
        className="z-40 flex items-center justify-center w-full h-40 bg-transparent bg-opacity-90"
        iconClassName="w-5 h-5 text-primary-500"
      />
    );
  }

  return (
    <>
      {/* {(!targetedFeaturesData || !targetedFeaturesData.length) && (
      <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
        No results found
      </div>
      )} */}

      {!!targetedFeaturesData && !!targetedFeaturesData.length && (
      <div className="relative flex flex-col flex-grow overflow-hidden">
        <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />
        <div className="relative h-full px-0.5 overflow-x-visible overflow-y-auto">

          <div className="py-6">
            <Item
              id="all-targets"
              defaultTarget={50}
              defaultFPF={1}
              isAllTargets
            />

            {/* {values.features.map((item, i) => {
              return (
                <div
                  className={cx({
                    'mt-1.5': i !== 0,
                  })}
                  key={`${item.id}`}
                >
                  <Item {...item} />
                </div>
              );
            })} */}
          </div>

        </div>
        <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-gray-700 via-gray-700" />
      </div>
      )}
    </>
  );
};

export default ScenariosFeaturesList;
