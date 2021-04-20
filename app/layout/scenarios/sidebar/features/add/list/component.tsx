import React from 'react';
import cx from 'classnames';

import Item from 'components/features/raw-item';

import { useAllFeatures } from 'hooks/features';
import Loading from 'components/loading';

export interface ScenariosFeaturesAddListProps {
  search?: string;
}

export const ScenariosFeaturesAddList: React.FC<ScenariosFeaturesAddListProps> = ({
  search,
}: ScenariosFeaturesAddListProps) => {
  const {
    data: allFeaturesData,
    isFetching: allFeaturesIsFetching,
    isFetched: allFeaturesIsFetched,
  } = useAllFeatures({ search });

  if (allFeaturesIsFetching && !allFeaturesIsFetched) {
    return (
      <Loading
        visible
        className="z-40 flex items-center justify-center w-full h-40 bg-transparent bg-opacity-90"
        iconClassName="w-5 h-5 text-primary-500"
      />
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute left-0 z-10 w-full h-6 -top-1 bg-gradient-to-b from-white via-white" />

      <div
        className={cx({
          'bg-white divide-y divide-black divide-dashed divide-opacity-20 h-full overflow-y-auto overflow-x-hidden px-8': true,
        })}
      >
        {(!allFeaturesData || !allFeaturesData.length) && (
          <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
            No results found
          </div>
        )}

        {allFeaturesData && allFeaturesData.map((item) => {
          return (
            <div key={`${item.id}`}>
              <Item
                {...item}
              />
            </div>
          );
        })}
      </div>

      <div className="absolute left-0 z-10 w-full h-6 -bottom-1 bg-gradient-to-t from-white via-white" />
    </div>
  );
};

export default ScenariosFeaturesAddList;
