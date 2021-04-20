import React, { useCallback } from 'react';
import cx from 'classnames';

import Item from 'components/features/raw-item';

import { useAllFeatures } from 'hooks/features';
import Loading from 'components/loading';

export interface ScenariosFeaturesAddListProps {
  search?: string;
  selected: number[] | string[];
  onToggleSelected: (selected: string | number) => void;
}

export const ScenariosFeaturesAddList: React.FC<ScenariosFeaturesAddListProps> = ({
  search,
  selected = [],
  onToggleSelected,
}: ScenariosFeaturesAddListProps) => {
  const {
    data: allFeaturesData,
    isFetching: allFeaturesIsFetching,
    isFetched: allFeaturesIsFetched,
  } = useAllFeatures({ search });

  const handleToggleSelected = useCallback((id) => {
    if (onToggleSelected) onToggleSelected(id);
  }, [onToggleSelected]);

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
    <div className="relative flex flex-col flex-grow overflow-hidden">
      <div className="absolute left-0 z-10 w-full h-6 -top-1 bg-gradient-to-b from-white via-white" />

      <div
        className={cx({
          'bg-white divide-y divide-black divide-dashed divide-opacity-20 overflow-y-auto overflow-x-hidden px-8': true,
        })}
      >
        {(!allFeaturesData || !allFeaturesData.length) && (
          <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
            No results found
          </div>
        )}

        {allFeaturesData && allFeaturesData.map((item) => {
          const selectedIndex = selected.findIndex((f) => f === item.id);
          return (
            <div key={`${item.id}`}>
              <Item
                {...item}
                selected={selectedIndex !== -1}
                onToggleSelected={() => {
                  handleToggleSelected(item.id);
                }}
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
