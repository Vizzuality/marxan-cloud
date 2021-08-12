import React from 'react';

import { useRouter } from 'next/router';

import cx from 'classnames';

import { useSelectedFeatures, useTargetedFeatures } from 'hooks/features';

import ShowTargetItem from 'components/features/show-target-spf-item';
import Loading from 'components/loading';

export interface ScenariosFeaturesListProps {

}

export const ScenariosFeaturesList: React.FC<ScenariosFeaturesListProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const {
    data: selectedFeaturesData,
  } = useSelectedFeatures(sid, {});

  const {
    data: targetedFeaturesData,
    isFetching: targetedFeaturesIsFetching,
    isFetched: targetedFeaturesIsFetched,
  } = useTargetedFeatures(sid);

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
      {(!selectedFeaturesData || !selectedFeaturesData.length) && (
      <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
        No results found
      </div>
      )}

      {!!selectedFeaturesData && !!selectedFeaturesData.length && (
      <div className="relative flex flex-col flex-grow overflow-hidden">
        <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />
        <div className="relative h-full px-0.5 overflow-x-visible overflow-y-auto">

          <div className="py-6">

            <div className="space-y-4">
              <div>
                {targetedFeaturesData && targetedFeaturesData instanceof Array
                  && targetedFeaturesData.map((item, itemIndex) => {
                    const { id } = item;
                    const firstFeature = itemIndex === 0;
                    return (
                      <div
                        className={cx({
                          'mt-1.5': itemIndex !== 0,
                        })}
                        key={`${id}`}
                      >
                        <ShowTargetItem
                          firstFeature={firstFeature}
                          {...item}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

        </div>
        <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-gray-700 via-gray-700" />
      </div>
      )}
    </>
  );
};

export default ScenariosFeaturesList;
