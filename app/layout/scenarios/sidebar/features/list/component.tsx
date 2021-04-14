import React from 'react';
import cx from 'classnames';

import Loading from 'components/loading';
import Item from 'components/features/selected-item';

import { useSelectedFeatures } from 'hooks/features';

export interface ScenariosFeaturesListProps {
}

export const ScenariosFeaturesList: React.FC<ScenariosFeaturesListProps> = () => {
  const {
    data: selectedFeaturesData,
    isFetching: selectedFeaturesIsFetching,
    isFetched: selectedFeaturesIsFetched,
  } = useSelectedFeatures({});

  if (selectedFeaturesIsFetching && !selectedFeaturesIsFetched) {
    return (
      <Loading
        visible
        className="z-40 flex items-center justify-center w-full h-40 bg-transparent bg-opacity-90"
        iconClassName="w-5 h-5 text-primary-500"
      />
    );
  }

  return (
    <div
      className="mt-5"
    >
      {(!selectedFeaturesData || !selectedFeaturesData.length) && (
        <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
          No results found
        </div>
      )}

      {
        !!selectedFeaturesData
        && selectedFeaturesData.length
        && selectedFeaturesData.map((item, i) => {
          return (
            <div
              className={cx({
                'mt-1.5': i !== 0,
              })}
              key={`${item.id}`}
            >
              <Item
                {...item}
              />
            </div>

          );
        })
}
    </div>
  );
};

export default ScenariosFeaturesList;
